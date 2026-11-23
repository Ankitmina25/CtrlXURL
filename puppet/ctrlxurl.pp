# =============================================================
# Puppet Manifest — CtrlXURL Server & Docker Container Management
# File: puppet/ctrlxurl.pp
#
# Tool: Puppet (Configuration Management)
# Role: Infrastructure ka desired state enforce karna
#
# Puppet ka kaam:
#   1. Golden .env master file manage karna host par
#   2. Docker containers (Redis & Backend) chalate rehna
#      -- Terraform se infrastructure ban'ti hai (network, containers)
#      -- Puppet ensure karta hai containers RUNNING rahen (self-healing)
#   3. In-container config drift protection:
#      - Agar /app/.env container ke andar delete ho jaye
#        Puppet auto-restore kar deta hai!
#   4. Pull Model: Cron se har 2 min automatic puppet apply
#
# NOTE: Terraform containers ko pehle banata hai.
#       Puppet unhe RUNNING state mein ensure karta hai.
# =============================================================

$project_dir = '/Users/ankitmeena/CodeBase/ProjectLab/URL-Shortner'
$docker_bin  = '/usr/local/bin/docker'

# Mac vs Linux group difference handle karo
$root_group = $facts['os']['family'] ? {
  'Darwin' => 'wheel',
  default  => 'root',
}

# ── 1. App Directory ──────────────────────────────────────────
# /opt/ctrlxurl — yahan host par golden config files rakhte hain
file { '/opt/ctrlxurl':
  ensure => directory,
  owner  => 'root',
  group  => $root_group,
  mode   => '0755',
}

# ── 2. Master Golden .env File on Host ────────────────────────
# Yeh GOLDEN copy hai — sach ka source
# Agar koi bhi container ke andar .env delete kare,
# Puppet is host file se restore karega
file { '/opt/ctrlxurl/.env':
  ensure  => file,
  owner   => 'root',
  group   => $root_group,
  mode    => '0600',
  content => "PORT=3000\nNODE_ENV=production\nBASE_URL=http://localhost:3000\nREDIS_URL=redis://ctrlxurl-redis:6379\nMANAGED_BY=Puppet-DevOps\n",
  require => File['/opt/ctrlxurl'],
}

# ── 3. Ensure Redis Container is Running ─────────────────────
# Terraform ne container banaya, Puppet ensure karta hai running rahe
# "unless" check: agar already running hai toh command mat chalaao
exec { 'ensure-redis-container-running':
  command => "${docker_bin} start ctrlxurl-redis",
  unless  => "${docker_bin} ps --filter 'name=ctrlxurl-redis' --filter 'status=running' --format '{{.Names}}' | grep -q 'ctrlxurl-redis'",
  path    => ['/usr/local/bin', '/usr/bin', '/bin'],
  cwd     => $project_dir,
}

# ── 4. Ensure Backend Container is Running ───────────────────
# Backend Redis ke baad start hota hai
exec { 'ensure-backend-container-running':
  command => "${docker_bin} start ctrlxurl-backend",
  unless  => "${docker_bin} ps --filter 'name=ctrlxurl-backend' --filter 'status=running' --format '{{.Names}}' | grep -q 'ctrlxurl-backend'",
  path    => ['/usr/local/bin', '/usr/bin', '/bin'],
  cwd     => $project_dir,
  require => Exec['ensure-redis-container-running'],
}

# ── 5. IN-CONTAINER MANAGEMENT: Drift Protection ─────────────
# Scenario: Koi developer ne container ke andar /app/.env delete kar diya
# Puppet detect karega (unless condition) aur host se copy karega
# Yeh IDEMPOTENT hai — baar baar chale lekin same result aaye
exec { 'sync-env-inside-backend-container':
  command     => "${docker_bin} cp /opt/ctrlxurl/.env ctrlxurl-backend:/app/.env",
  unless      => "/bin/bash -c '${docker_bin} ps -q -f name=ctrlxurl-backend | grep -q . && ${docker_bin} exec ctrlxurl-backend test -f /app/.env && [ \"$(${docker_bin} exec ctrlxurl-backend wc -l < /app/.env | tr -d \" \")\" = \"$(wc -l < /opt/ctrlxurl/.env | tr -d \" \")\" ]'",
  path        => ['/usr/local/bin', '/usr/bin', '/bin'],
  environment => ['HOME=/root'],
  require     => [Exec['ensure-backend-container-running'], File['/opt/ctrlxurl/.env']],
}

# ── 6. PULL MODEL: Automatic Self-Healing Every 2 Minutes ────
# Cron job — har 2 minute mein puppet apply automatic chalega
# Self-healing = agar kuch toota, Puppet khud theek kar lega
cron { 'puppet-docker-auto-heal':
  command => "export PATH=\$PATH:/usr/local/bin:/usr/bin:/opt/puppetlabs/bin && puppet apply ${project_dir}/puppet/ctrlxurl.pp > /tmp/puppet_heal.log 2>&1",
  user    => 'root',
  minute  => '*/2',
  ensure  => present,
}
