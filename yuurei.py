id_to_node = {}

class LinkedList:
  def __init__(self):
    self.length = 0
    self.start = None
    self.end = None

  def push(self, value):
    node = Node(value)
    if self.length == 0:
      self.start = node
      self.end = node
    else:
      self.end.next = node
      node.prev = self.end
      self.end = node
    self.length += 1

  def pop(self):
    value = self.end.value
    self.end = self.end.prev
    self.length -= 1
    return value

class Node:
  def __init__(self, value):
    self.prev = None
    self.next = None
    self.value = value

list = LinkedList()
list.push(10)
list.push(20)
list.push(30)
list.push(40)
list.push(10)
list.push(40)

print(list.pop())
print(list.pop())
print(list.pop())
print(list.pop())
print(list.pop())
print(list.pop())
