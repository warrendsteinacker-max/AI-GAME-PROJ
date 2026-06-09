[Windows.Networking.NetworkOperators.NetworkOperatorTetheringManager, Windows.Networking.NetworkOperators, ContentType=WindowsRuntime] | Out-Null
$profile = [Windows.Networking.Connectivity.NetworkInformation]::GetInternetConnectionProfile()
$manager = [Windows.Networking.NetworkOperators.NetworkOperatorTetheringManager]::CreateFromConnectionProfile($profile)
$config = $manager.GetCurrentAccessPointConfiguration()
$config.Ssid = 'MyDesktopAppHotspot'
$config.Passphrase = 'Password123'
$manager.ConfigureAccessPointAsync($config) | Out-Null
if ($manager.TetheringOperationalState -eq 'Off') { $manager.StartTetheringAsync() | Out-Null }