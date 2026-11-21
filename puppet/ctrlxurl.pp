# =============================================================
# Puppet Manifest — CtrlXURL Server Setup
# File: puppet/ctrlxurl.pp
#
# Ye manifest ek naye Ubuntu server par:
#   1. Docker install karta hai
#   2. Docker service start karta hai
#   3. App ke liye /opt/ctrlxurl folder banata hai
#
# Apply karne ka command:
#   sudo puppet apply puppet/ctrlxurl.pp
# =============================================================

# Step 1: Docker install karo
exec { 'install-docker':
  command => '/bin/bash -c "curl -fsSL https://get.docker.com | sh"',
  creates => '/usr/bin/docker',
  path    => ['/usr/bin', '/bin'],
}

# Step 2: Docker service start karo (aur boot par bhi chalaye)
service { 'docker':
  ensure  => running,
  enable  => true,
  require => Exec['install-docker'],
}

# Step 3: App folder banao
file { '/opt/ctrlxurl':
  ensure  => directory,
  owner   => 'root',
  group   => 'root',
  mode    => '0755',
  require => Service['docker'],
}

# Step 4: Port 3000 (backend) aur 80 (frontend) open karo
exec { 'open-port-3000':
  command => '/usr/sbin/ufw allow 3000/tcp',
  unless  => '/usr/sbin/ufw status | grep -q 3000',
  require => File['/opt/ctrlxurl'],
}

exec { 'open-port-80':
  command => '/usr/sbin/ufw allow 80/tcp',
  unless  => '/usr/sbin/ufw status | grep -q "80/tcp"',
  require => File['/opt/ctrlxurl'],
}

