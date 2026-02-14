try:
    from langchain.memory import ConversationBufferMemory
except ImportError:
    ConversationBufferMemory = None

class MemoryManager:
    def __init__(self):
        # Using ConversationBufferMemory to maintain context.
        # As per requirements: "Store only: Last crop discussed, Last recommended primary pathway, Farmer preference signals"
        if ConversationBufferMemory:
            self.memory = ConversationBufferMemory(
                memory_key="history",
                return_messages=True
            )
        else:
            print("Warning: langchain.memory not found. Using simple fallback.")
            self.memory = SimpleMemory()

    def get_memory(self):
        return self.memory

    def clear_memory(self):
        self.memory.clear()

class SimpleMemory:
    def __init__(self):
        self.history = {}
    
    def load_memory_variables(self, inputs):
        return {"history": self.history.get("history", [])}
    
    def save_context(self, inputs, outputs):
        # Mock saving context
        if "history" not in self.history:
            self.history["history"] = []
        self.history["history"].append(f"Human: {inputs.get('input')}")
        self.history["history"].append(f"AI: {outputs.get('output')}")
    
    def clear(self):
        self.history = {}

