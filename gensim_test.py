from gensim import models

model = models.KeyedVectors.load_word2vec_format('model.vec', binary=False)
print(model.most_similar(positive=['日本人']))