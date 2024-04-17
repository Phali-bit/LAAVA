
import os
import sys
from langchain.chains import ConversationalRetrievalChain
from langchain_openai import OpenAIEmbeddings
from langchain.document_loaders import UnstructuredFileLoader
from langchain.indexes import VectorstoreIndexCreator
from langchain.indexes.vectorstore import VectorStoreIndexWrapper
from langchain_openai import ChatOpenAI
from langchain_community.vectorstores import Chroma
import constants

os.environ["OPENAI_API_KEY"] = constants.APIKEY

# Enable to save to disk & reuse the model (for repeated queries on the same data)
PERSIST = False

query = None

# Check if command-line arguments are provided
if len(sys.argv) > 1:
    query = ' '.join(sys.argv[1:])

if PERSIST and os.path.exists("persist"):
    print("Reusing index...\n")
    vectorstore = Chroma(persist_directory="persist",
                         embedding_function=OpenAIEmbeddings())
    index = VectorStoreIndexWrapper(vectorstore=vectorstore)
else:
    # Use UnstructuredFileLoader to handle encoding issues automatically
    loader = UnstructuredFileLoader("data.txt")

    if PERSIST:
        index = VectorstoreIndexCreator(
            vectorstore_kwargs={"persist_directory": "persist"}).from_loaders([loader])
    else:
        index = VectorstoreIndexCreator().from_loaders([loader])

chain = ConversationalRetrievalChain.from_llm(
    llm=ChatOpenAI(model="gpt-3.5-turbo"),
    retriever=index.vectorstore.as_retriever(search_kwargs={"k": 1}),
)

chat_history = []

# Only proceed if a query is provided
if query:
    result = chain({"question": query, "chat_history": chat_history})
    print(result['answer'])
    chat_history.append((query, result['answer']))
# import os
# import sys
# from langchain.chains import ConversationalRetrievalChain
# from langchain.embeddings import SentenceTransformerEmbeddings
# from langchain.document_loaders import UnstructuredFileLoader
# from langchain.indexes import VectorstoreIndexCreator
# from langchain.indexes.vectorstore import VectorStoreIndexWrapper
# from langchain_community.vectorstores import Chroma
# from langchain.llms import HuggingFacePipeline

# # Enable to save to disk & reuse the model (for repeated queries on the same data)
# PERSIST = True

# # Initialize the embeddings
# embeddings = SentenceTransformerEmbeddings()

# if PERSIST and os.path.exists("persist"):
#     print("Reusing index...\n")
#     vectorstore = Chroma(persist_directory="persist")
#     index = VectorStoreIndexWrapper(vectorstore=vectorstore)
# else:
#     # Load the data file
#     loader = UnstructuredFileLoader("data.txt")

#     if PERSIST:
#         index = VectorstoreIndexCreator(
#             vectorstore_kwargs={"persist_directory": "persist"},
#             embedding=embeddings
#         ).from_loaders([loader])
#     else:
#         index = VectorstoreIndexCreator(embedding=embeddings).from_loaders([loader])

# # Set up the chat chain
# model_name = "google/flan-t5-xl"  # You can choose a different model here
# model = HuggingFacePipeline.from_model_id(model_name, task="text2text-generation")
# chain = ConversationalRetrievalChain.from_llm(model, retriever=index.vectorstore.as_retriever(search_kwargs={"k": 1}))

# chat_history = []

# # Function to handle user input
# def get_user_input():
#     return input("Enter your query (or 'quit' to exit): ").strip()

# # Main loop
# while True:
#     query = get_user_input()

#     if query.lower() == "quit":
#         break

#     result = chain({"question": query, "chat_history": chat_history})
#     print(f"AI: {result['answer']}\n")
#     chat_history.append((query, result["answer"]))