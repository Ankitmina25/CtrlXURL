# =============================================================
# Puppet Master Main Manifest — CtrlXURL Client-Server Architecture
# File: puppet/manifests/site.pp
#
# Master-Agent Model:
# 1. Puppet Master serves this catalog to Puppet Agent over SSL (Port 8140).
# 2. Puppet Agent requests catalog, verifies certificate, and applies desired state.
# 3. AUTO-HEALING: If redis, backend, frontend, or nagios stops,
#    Puppet automatically restarts them back to running state!
# =============================================================

node default {

  # ── 1. Proof of Master-Agent SSL Handshake ───────────────────
  file { '/tmp/puppet-client-server-verified.txt':
    ensure  => file,
    owner   => 'root',
    mode    => '0644',
    content => "===============================================\nCtrlXURL DevOps — Puppet Master-Agent Architecture\n===============================================\nStatus: Active & Verified\nArchitecture: Client-Server with SSL Certificate Validation\nNode: ${trusted['certname']}\nServer: Puppet Master (Port 8140)\nManaged: Desired State & Auto-Healing Enforced\nAuto-Heal Interval: 60 Seconds (Every 1 Minute)\n",
  }

  # ── 2. Master App Directory & Golden Config ──────────────────
  file { '/opt/ctrlxurl':
    ensure => directory,
    owner  => 'root',
    mode   => '0755',
  }

  file { '/opt/ctrlxurl/.env':
    ensure  => file,
    owner   => 'root',
    mode    => '0600',
    content => "PORT=3000\nNODE_ENV=production\nBASE_URL=http://localhost:3000\nREDIS_URL=redis://ctrlxurl-redis:6379\nMANAGED_BY=PuppetMaster-Agent-SSL\n",
    require => File['/opt/ctrlxurl'],
  }

  # ── 3. AUTO-HEALING: Ensure Redis Container is Running ────────
  exec { 'ensure-redis-running':
    command => '/usr/local/bin/docker start ctrlxurl-redis',
    unless  => "/usr/local/bin/docker ps --filter 'name=ctrlxurl-redis' --filter 'status=running' -q | grep .",
    path    => ['/usr/local/bin', '/usr/bin', '/bin'],
  }

  # ── 4. AUTO-HEALING: Ensure Backend Container is Running ──────
  exec { 'ensure-backend-running':
    command => '/usr/local/bin/docker start ctrlxurl-backend',
    unless  => "/usr/local/bin/docker ps --filter 'name=ctrlxurl-backend' --filter 'status=running' -q | grep .",
    path    => ['/usr/local/bin', '/usr/bin', '/bin'],
    require => Exec['ensure-redis-running'],
  }

  # ── 5. AUTO-HEALING: Ensure Frontend Container is Running ─────
  exec { 'ensure-frontend-running':
    command => '/usr/local/bin/docker start ctrlxurl-frontend',
    unless  => "/usr/local/bin/docker ps --filter 'name=ctrlxurl-frontend' --filter 'status=running' -q | grep .",
    path    => ['/usr/local/bin', '/usr/bin', '/bin'],
    require => Exec['ensure-backend-running'],
  }

  # ── 6. AUTO-HEALING: Ensure Nagios Container is Running ───────
  exec { 'ensure-nagios-running':
    command => '/usr/local/bin/docker start ctrlxurl-nagios',
    unless  => "/usr/local/bin/docker ps --filter 'name=ctrlxurl-nagios' --filter 'status=running' -q | grep .",
    path    => ['/usr/local/bin', '/usr/bin', '/bin'],
  }

  # ── 7. Self-Healing Notification ─────────────────────────────
  notify { 'puppet-agent-state-applied':
    message => "Puppet Master catalog synchronized! All 4 containers (redis, backend, frontend, nagios) enforced to RUNNING state.",
  }
}
