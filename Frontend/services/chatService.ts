import { db } from '../firebase';
import {
    collection,
    addDoc,
    query,
    where,
    orderBy,
    limit,
    getDocs,
    serverTimestamp,
    doc,
    setDoc,
    updateDoc,
    getDoc,
    startAfter,
    onSnapshot
} from 'firebase/firestore';

export interface ChatSession {
    id: string;
    userId: string;
    title: string;
    createdAt: any;
    updatedAt: any;
    model: string;
    backendSessionId?: string;
}

export interface Message {
    id?: string;
    role: 'user' | 'assistant' | 'model'; // 'model' is legacy, mapping to 'assistant'
    content: string;
    createdAt: any;
}

const USERS_COLLECTION = 'users';
const CHATS_COLLECTION = 'chats';
const MESSAGES_COLLECTION = 'messages';

export const chatService = {
    /**
     * Creates a new chat session for a user
     */
    createChat: async (userId: string, initialTitle: string = "New Chat", backendSessionId?: string): Promise<string> => {
        try {
            const chatRef = collection(db, USERS_COLLECTION, userId, CHATS_COLLECTION);
            const newChat = await addDoc(chatRef, {
                userId,
                title: initialTitle,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
                model: 'krishi-advisor-v1',
                backendSessionId
            });
            return newChat.id;
        } catch (error) {
            console.error("Error creating chat:", error);
            throw error;
        }
    },

    /**
     * Updates the title of a chat
     */
    updateChatTitle: async (userId: string, chatId: string, title: string) => {
        try {
            const chatDocRef = doc(db, USERS_COLLECTION, userId, CHATS_COLLECTION, chatId);
            await updateDoc(chatDocRef, { title });
        } catch (error) {
            console.error("Error updating chat title:", error);
        }
    },

    /**
     * Update the updatedAt timestamp of a chat (e.g. when a new message is sent)
     */
    updateChatTimestamp: async (userId: string, chatId: string) => {
        try {
            const chatDocRef = doc(db, USERS_COLLECTION, userId, CHATS_COLLECTION, chatId);
            await updateDoc(chatDocRef, { updatedAt: serverTimestamp() });
        } catch (error) {
            console.error("Error updating chat timestamp:", error);
        }
    },

    /**
     * Update the backend session ID for a chat (e.g. when session needs to be reinitialized)
     */
    updateChatBackendSession: async (userId: string, chatId: string, backendSessionId: string) => {
        try {
            const chatDocRef = doc(db, USERS_COLLECTION, userId, CHATS_COLLECTION, chatId);
            await updateDoc(chatDocRef, { backendSessionId });
        } catch (error) {
            console.error("Error updating chat backend session:", error);
        }
    },

    /**
     * Fetch user's chat history ordered by most recent
     */
    getUserChats: async (userId: string, limitCount: number = 20): Promise<ChatSession[]> => {
        try {
            const chatsRef = collection(db, USERS_COLLECTION, userId, CHATS_COLLECTION);
            const q = query(chatsRef, orderBy('updatedAt', 'desc'), limit(limitCount));
            const snapshot = await getDocs(q);
            return snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            } as ChatSession));
        } catch (error) {
            console.error("Error fetching chats:", error);
            return [];
        }
    },

    /**
     * Real-time listener for user chats
     */
    subscribeToUserChats: (userId: string, callback: (chats: ChatSession[]) => void) => {
        const chatsRef = collection(db, USERS_COLLECTION, userId, CHATS_COLLECTION);
        const q = query(chatsRef, orderBy('updatedAt', 'desc'), limit(50));

        return onSnapshot(q, (snapshot) => {
            const chats = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            } as ChatSession));
            callback(chats);
        });
    },

    /**
     * Save a message to a chat session
     */
    saveMessage: async (userId: string, chatId: string, message: Message) => {
        try {
            const messagesRef = collection(db, USERS_COLLECTION, userId, CHATS_COLLECTION, chatId, MESSAGES_COLLECTION);
            await addDoc(messagesRef, {
                role: message.role,
                content: message.content,
                createdAt: serverTimestamp()
            });

            // Update the chat's updatedAt field
            await chatService.updateChatTimestamp(userId, chatId);
        } catch (error) {
            console.error("Error saving message:", error);
            throw error;
        }
    },

    /**
     * Fetch messages for a specific chat
     */
    getChatMessages: async (userId: string, chatId: string, limitCount: number = 50): Promise<Message[]> => {
        try {
            const messagesRef = collection(db, USERS_COLLECTION, userId, CHATS_COLLECTION, chatId, MESSAGES_COLLECTION);
            // Order by desc to get most recent, then reverse for display
            const q = query(messagesRef, orderBy('createdAt', 'desc'), limit(limitCount));

            const snapshot = await getDocs(q);
            const msgs = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            } as Message));

            return msgs.reverse();
        } catch (error) {
            console.error("Error fetching messages:", error);
            return [];
        }
    },

    /**
     * Delete a chat session
     */
    deleteChat: async (userId: string, chatId: string) => {
        // Note: This only deletes the chat metadata doc. 
        // Subcollections (messages) are NOT automatically deleted in client-side Firestore.
        // For a hackathon/MVP, this is acceptable, or use a Cloud Function.
        try {
            // We'll leave it simple for now and just delete the top doc
            await setDoc(doc(db, USERS_COLLECTION, userId, CHATS_COLLECTION, chatId), { deleted: true }, { merge: true });
            // Ideally we should actually delete it
            // await deleteDoc(doc(db, USERS_COLLECTION, userId, CHATS_COLLECTION, chatId));
        } catch (error) {
            console.error("Error deleting chat:", error);
        }
    }
};
