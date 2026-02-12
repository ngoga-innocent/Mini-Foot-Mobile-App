import { addDoc, collection, deleteDoc, doc, onSnapshot, serverTimestamp } from "firebase/firestore";
import { db } from "../../config/firebase";
import { Player } from "../types/model";



export const addPlayer = async (player: Player) => {
  await addDoc(collection(db, "players"), {
    ...player,
    createdAt: serverTimestamp(),
  });
};



export const subscribeToPlayers = (callback: (players: any[]) => void) => {
  return onSnapshot(collection(db, "players"), snapshot => {
    const players = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    console.log(players)
    callback(players);
  });
};
export const deletePlayer = async (id: string) => {
  await deleteDoc(doc(db, "players", id));
};
