# =============================================================
# Puppet Manifest — CtrlXURL Server & Docker Container Management
# File: puppet/ctrlxurl.pp
#
# Advanced Capabilities:
#   1. Golden .env Master File Management on Host
#   2. Docker Container Lifecycle (Redis & Backend)
#   3. IN-CONTAINER CONFIG DRIFT PROTECTION:
#      - Injects /app/.env into running 'ctrlxurl-backend'
#      - If /app/.env is deleted or altered inside the container,
#        Puppet automatically re-injects the golden configuration!
#   4. Pull Model Automation (Cron every 2 minutes)
# =============================================================

$project_dir  = '/Users/ankitmeena/CodeBase/ProjectLab/URL-Shortner'
$docker_bin   = '/usr/local/bin/docker'
$compose_bin  = '/usr/local/bin/docker-compose'

$root_group = $facts['os']['family'] ? {
  'Darwin' => 'wheel',
  default  => 'root',
}

# ── 1. App Directory ─────────────────────────────────────────
file { '/opt/ctrlxurl':
  ensure => directory,
  owner  => 'root',
  group  => $root_group,
  mode   => '0755',
}

# ── 2. Master Golden .env File on Host ────────────────────────
file { '/opt/ctrlxurl/.env':
  ensure  => file,
  owner   => 'root',
  group   => $root_group,
  mode    => '0600',
  content => "PORT=3000\nNODE_ENV=production\nBASE_URL=http://localhost:3000\nREDIS_URL=redis://redis:6379\nMANAGED_BY=Puppet-DevOps\n",
  require => File['/opt/ctrlxurl'],
}

# ── 3. Ensure Redis Container is Running ─────────────────────
exec { 'ensure-redis-container-running':
  command     => "${compose_bin} -f ${project_dir}/docker-compose.yml up -d redis",
  unless      => "${docker_bin} ps --filter 'name=ctrlxurl-redis' --filter 'status=running' --format '{{.Names}}' | grep -q 'ctrlxurl-redis'",
  path        => ['/usr/local/bin', '/usr/bin', '/bin'],
  cwd         => $project_dir,
  environment => ['HOME=/root'],
}

# ── 4. Ensure Backend Container is Running ───────────────────
exec { 'ensure-backend-container-running':
  command     => "${compose_bin} -f ${project_dir}/docker-compose.yml up -d backend",
  unless      => "${docker_bin} ps --filter 'name=ctrlxurl-backend' --filter 'status=running' --format '{{.Names}}' | grep -q 'ctrlxurl-backend'",
  path        => ['/usr/local/bin', '/usr/bin', '/bin'],
  cwd         => $project_dir,
  environment => ['HOME=/root'],
  require     => Exec['ensure-redis-container-running'],
}

# ── 5. IN-CONTAINER MANAGEMENT: Protect /app/.env Inside Container
# If /app/.env inside container is deleted or modified, restore it!
exec { 'sync-env-inside-backend-container':
  command     => "${docker_bin} cp /opt/ctrlxurl/.env ctrlxurl-backend:/app/.env",
  unless      => "/bin/bash -c '${docker_bin} ps -q -f name=ctrlxurl-backend | grep -q . && ${docker_bin} exec ctrlxurl-backend test -f /app/.env && [ \"\$(${docker_bin} exec ctrlxurl-backend wc -l < /app/.env | tr -d \" \")\" = \"\$(wc -l < /opt/ctrlxurl/.env | tr -d \" \")\" ]'",
  path        => ['/usr/local/bin', '/usr/bin', '/bin'],
  environment => ['HOME=/root'],
  require     => [Exec['ensure-backend-container-running'], File['/opt/ctrlxurl/.env']],
}

# ── 6. PULL MODEL: Automatic Self-Healing Every 2 Minutes ────
cron { 'puppet-docker-auto-heal':
  command => "export PATH=\$PATH:/usr/local/bin:/usr/bin:/opt/puppetlabs/bin && puppet apply ${project_dir}/puppet/ctrlxurl.pp > /tmp/puppet_heal.log 2>&1",
  user    => 'root',
  minute  => '*/2',
  ensure  => present,
}
