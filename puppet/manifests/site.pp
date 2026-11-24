# =============================================================
# Puppet Master Main Manifest — CtrlXURL Client-Server Architecture
# File: puppet/manifests/site.pp
#
# Master-Agent Model:
# 1. Puppet Master serves this catalog to Puppet Agent over SSL (Port 8140).
# 2. Puppet Agent requests catalog, verifies certificate, and applies desired state.
# 3. Ensures configuration consistency & self-healing across nodes.
# =============================================================

node default {

  # ── 1. Proof of Master-Agent SSL Handshake ───────────────────
  file { '/tmp/puppet-client-server-verified.txt':
    ensure  => file,
    owner   => 'root',
    mode    => '0644',
    content => "===============================================\nCtrlXURL DevOps — Puppet Master-Agent Architecture\n===============================================\nStatus: Active & Verified\nArchitecture: Client-Server with SSL Certificate Validation\nNode: ${trusted['certname']}\nServer: Puppet Master (Port 8140)\nManaged: Desired State & Self-Healing Enforced\n",
  }

  # ── 2. Master App Directory ──────────────────────────────────
  file { '/opt/ctrlxurl':
    ensure => directory,
    owner  => 'root',
    mode   => '0755',
  }

  # ── 3. Golden Configuration (.env) ───────────────────────────
  file { '/opt/ctrlxurl/.env':
    ensure  => file,
    owner   => 'root',
    mode    => '0600',
    content => "PORT=3000\nNODE_ENV=production\nBASE_URL=http://localhost:3000\nREDIS_URL=redis://ctrlxurl-redis:6379\nMANAGED_BY=PuppetMaster-Agent-SSL\n",
    require => File['/opt/ctrlxurl'],
  }

  # ── 4. Self-Healing Notification ─────────────────────────────
  notify { 'puppet-agent-state-applied':
    message => "Puppet Master successfully compiled catalog for ${trusted['certname']}. Desired state is synchronized!",
  }
}
