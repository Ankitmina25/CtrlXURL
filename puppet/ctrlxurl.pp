# =============================================================
# Puppet Manifest — CtrlXURL Server Configuration
# File: puppet/ctrlxurl.pp
#
# Puppet ek Configuration Management tool hai.
# Ye declarative language use karta hai — hum define karte hain
# "server ka desired state kya hona chahiye" aur Puppet ensure
# karta hai ki server hamesha us state mein rahe.
#
# Agar koi manually Docker uninstall kar de, ya firewall rule
# hata de — Puppet agle run mein automatically fix kar dega.
# Isse "Configuration Drift Prevention" kehte hain.
#
# Target OS : Ubuntu 22.04 (production server)
# Local demo : Mac (Docker Desktop)
#
# Commands:
#   Dry run (no changes, only shows what would happen):
#     sudo puppet apply puppet/ctrlxurl.pp --noop
#
#   Actual apply (makes real changes on server):
#     sudo puppet apply puppet/ctrlxurl.pp
# =============================================================

# ── Resource 1: Install Docker ─────────────────────────────────────────────
# Puppet checks if /usr/bin/docker exists.
# If it does NOT exist, it runs the official Docker install script.
# If it already exists, this step is skipped automatically.
exec { 'install-docker':
  command => '/bin/bash -c "curl -fsSL https://get.docker.com | sh"',
  creates => '/usr/bin/docker',    # Skip if this file already exists
  path    => ['/usr/bin', '/bin'],
}

# ── Resource 2: Create Application Directory ───────────────────────────────
# Puppet ensures /opt/ctrlxurl directory exists with correct permissions.
# If someone deletes it, Puppet recreates it on next run.
file { '/opt/ctrlxurl':
  ensure => directory,
  owner  => 'root',
  group  => 'root',
  mode   => '0755',
}

# ── Resources 3 & 4: Linux-only (Ubuntu/Debian/RedHat) ────────────────────
# These resources only apply on Linux production servers.
# On Mac, Docker Desktop is used instead — Puppet skips these blocks.
if $facts['os']['family'] == 'Debian' or $facts['os']['family'] == 'RedHat' {

  # Ensure Docker service is running and starts on system boot
  service { 'docker':
    ensure  => running,   # Docker daemon must be running
    enable  => true,      # Auto-start on server reboot
    require => Exec['install-docker'],
  }

  # Open port 80 (HTTP / Frontend) in UFW firewall
  exec { 'open-port-80':
    command => '/usr/sbin/ufw allow 80/tcp',
    unless  => '/usr/sbin/ufw status | grep -q "80/tcp"',  # Skip if already open
    path    => ['/usr/sbin', '/usr/bin'],
    require => File['/opt/ctrlxurl'],
  }

  # Open port 3000 (Backend API) in UFW firewall
  exec { 'open-port-3000':
    command => '/usr/sbin/ufw allow 3000/tcp',
    unless  => '/usr/sbin/ufw status | grep -q 3000',       # Skip if already open
    path    => ['/usr/sbin', '/usr/bin'],
    require => File['/opt/ctrlxurl'],
  }

} else {

  # On Mac: Print an informational notice instead
  notify { 'mac-notice':
    message => 'Mac detected: Use Docker Desktop to manage services. UFW firewall rules apply only on Linux servers.',
  }

}
