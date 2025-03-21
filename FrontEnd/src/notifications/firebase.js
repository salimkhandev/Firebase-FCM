// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getMessaging,getToken } from "firebase/messaging";

const firebaseConfig = {
    apiKey: "AIzaSyBitV6MCQj4INcj_yfW4ljILifa-7ziRik",
    authDomain: "pwa-push-notification-8649b.firebaseapp.com",
    projectId: "pwa-push-notification-8649b",
    storageBucket: "pwa-push-notification-8649b.firebasestorage.app",
    messagingSenderId: "504230264197",
    appId: "1:504230264197:web:6723b541451cb8fd2498ec",
    measurementId: "G-HL2TYM3QF6"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const messaging = getMessaging(app);

export const generateToken=async()=>{
    const permission=await Notification.requestPermission();
  console.log('permission',permission);
  if(permission==="granted"){
    const token=await getToken(messaging,
      {
        vapidKey: "BAn4WwlX_0W2yPQmTwirzQ6V20xjQwQTFjcrOCwhnwbAkD1L18ZWD5rC78TW1v9ye9D8hIqcvxWJvfXwHPFUIq8"
      }
    );
  console.log('token',token);
  localStorage.setItem('token',token);
}
}