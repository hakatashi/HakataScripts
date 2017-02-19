require! {
  \tokenize-markdown
}

m = '''
# hoge

ほげふが
ぴよぴよ

はげはげ
むげむげ
'''

tokenize-markdown.from-string m |> console.log
