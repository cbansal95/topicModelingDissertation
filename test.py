from transformers import pipeline
summarizer = pipeline("summarization", model="slauw87/bart_summarisation")
conversation = '''Sugi: I am tired of everything in my life. 
Tommy: What? How happy you life is! I do envy you.
Sugi: You don't know that I have been over-protected by my mother these years. I am really about to leave the family and spread my wings.
Tommy: Maybe you are right.                                           
'''
summarizer(conversation)
