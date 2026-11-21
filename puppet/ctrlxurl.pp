# =============================================================
# Puppet Manifest — CtrlXURL Server Setup
# File: puppet/ctrlxurl.pp
#
# Production target: Ubuntu 22.04
# Local demo:        Mac (Docker Desktop)
#
# Apply karne ka command:
#   sudo puppet apply puppet/ctrlxurl.pp --noop   ← dry run
#   sudo puppet apply puppet/ctrlxurl.pp           ← actual apply
# =============================================================

# Step 1: Docker install karo (sirf agar nahi hai toh)
exec { 'install-docker':
  command => '/bin/bash -c "curl -fsSL https://get.docker.com | sh"',
  creates => '/usr/bin/docker',      # agar /usr/bin/docker hai toh skip
  path    => ['/usr/bin', '/bin'],
}

# Step 2: App ke liye folder banao
file { '/opt/ctrlxurl':
  ensure => directory,
  owner  => 'root',
  group  => 'root',
  mode   => '0755',
}

# Step 3: Docker service ensure (sirf Linux/Ubuntu par)
# Mac par Docker Desktop manually start hota hai
if $facts['os']['family'] == 'Debian' or $facts['os']['family'] == 'RedHat' {

  service { 'docker':
    ensure  => running,
    enable  => true,
    require => Exec['install-docker'],
  }

  # Step 4: Firewall ports open karo (sirf Linux par, ufw use karke)
  exec { 'open-port-80':
    command => '/usr/sbin/ufw allow 80/tcp',
    unless  => '/usr/sbin/ufw status | grep -q "80/tcp"',
    path    => ['/usr/sbin', '/usr/bin'],
    require => File['/opt/ctrlxurl'],
  }

  exec { 'open-port-3000':
    command => '/usr/sbin/ufw allow 3000/tcp',
    unless  => '/usr/sbin/ufw status | grep -q 3000',
    path    => ['/usr/sbin', '/usr/bin'],
    require => File['/opt/ctrlxurl'],
  }

} else {
  # Mac par sirf notice print karo
  notify { 'mac-notice':
    message => 'Mac detected: Docker Desktop use karo. Firewall (ufw) sirf Linux par configure hoga.',
  }
}
