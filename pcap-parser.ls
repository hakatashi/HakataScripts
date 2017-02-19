require! {
  'pcap-parser'
  'shallow-equals': eq
}

parser = pcap-parser.parse 'client01.pcap'
packet <- parser.on \packet

{timestamp-seconds, timestamp-microseconds} = packet.header
timestamp = new Date timestamp-seconds * 1000 + timestamp-microseconds / 1000

dst-mac = packet.data.slice 0, 6 .to-string \hex
src-mac = packet.data.slice 6, 12 .to-string \hex
data-type = packet.data.read-int16BE 12

if data-type is 0x0806
  if src-mac is \080027ac6b57 and dst-mac is \ffffffffffff
    event = \arp_request
  else if src-mac is \525400123502 and dst-mac is \080027ac6b57
    event = \arp_response

else if data-type is 0x0800
  ip-header-length = (packet.data.14 .&. 2~00001111) * 4
  ip-header = packet.data.slice 14, 14 + ip-header-length

  

console.log event if event

