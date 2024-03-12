Add-Type -AssemblyName PresentationCore
Get-ChildItem "Z:\Data\Fonts" | 
Foreach-Object {
  $fontName = (New-Object -TypeName Windows.Media.GlyphTypeface -ArgumentList $_.FullName).Win32FamilyNames.Values
  Write-Output $_.FullName
  Write-Output $fontName
}