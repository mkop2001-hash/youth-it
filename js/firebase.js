// Firebase 기본 설정
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

 const firebaseConfig = {
    apiKey: "AIzaSyCyVedJuQp-WlVgxElhPLw87kBT_hbCy3k",
    authDomain: "youth-it-2e80e.firebaseapp.com",
    projectId: "youth-it-2e80e",
    storageBucket: "youth-it-2e80e.firebasestorage.app",
    messagingSenderId: "647500223077",
    appId: "1:647500223077:web:aaa5dd04468463173eec8c",
    measurementId: "G-LKD00C81X2"
  };


const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
