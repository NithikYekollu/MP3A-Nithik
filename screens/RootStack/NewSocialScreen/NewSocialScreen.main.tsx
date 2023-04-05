import React, { useState, useEffect } from "react";
import { Platform, View } from "react-native";
import { Appbar, TextInput, Snackbar, Button } from "react-native-paper";
import { getFileObjectAsync, uuid } from "../../../Utils";

// See https://github.com/mmazzarolo/react-native-modal-datetime-picker
// Most of the date picker code is directly sourced from the example.

// See https://docs.expo.io/versions/latest/sdk/imagepicker/
// Most of the image picker code is directly sourced from the example.
import * as ImagePicker from "expo-image-picker";
import { styles } from "./NewSocialScreen.styles";

import firebase from "firebase/app";
import "firebase/firestore";
import { SocialModel } from "../../../models/social";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../RootStackScreen";
import { addDoc, collection, getFirestore, setDoc } from 'firebase/firestore';
import { getDownloadURL, getStorage, ref, uploadBytes, UploadResult } from "firebase/storage";
import { getApp } from 'firebase/app';
import DateTimePickerModal from "react-native-modal-datetime-picker";


interface Props {
  navigation: StackNavigationProp<RootStackParamList, "NewSocialScreen">;
}

export default function NewSocialScreen({ navigation }: Props) {
  /* TODO: Declare state variables for all of the attributes 
           that you need to keep track of on this screen.
    
     HINTS:

      1. There are five core attributes that are related to the social object.
      2. There are two attributes from the Date Picker.
      3. There is one attribute from the Snackbar.
      4. There is one attribute for the loading indicator in the submit button.
  
  */
   const [eventName, setName] = useState("");
   const [eventLocation, setEventLocation] = useState("");
   const [description, setDescription] = useState("");
   const [eventImage, setEventImage] = useState("");
   const [eventDate, setEventDate] = useState("");
   const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
   const [snackbarVisible, setSnackbarVisible] = useState(false);
   const[load, setLoad] = useState(false);
    




  // TODO: Follow the Expo Docs to implement the ImagePicker component.
  // https://docs.expo.io/versions/latest/sdk/imagepicker/

  const imagePicker = async () => { 
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    console.log(result);

    if (!result.canceled) {
      console.log(result.assets[0].uri);
      setEventImage(result.assets[0].uri);
    }
  };



  // TODO: Follow the GitHub Docs to implement the react-native-modal-datetime-picker component.
  // https://github.com/mmazzarolo/react-native-modal-datetime-picker

  const showDatePicker = () => {
    setDatePickerVisibility(true);
  };

  const hideDatePicker = () => {
    setDatePickerVisibility(false);
  };

  

  const handleConfirm = (date: Date) => {
    setEventDate(date.toString());
    hideDatePicker();
  };



  // TODO: Follow the SnackBar Docs to implement the Snackbar component.
  // https://callstack.github.io/react-native-paper/snackbar.html
  const onToggleSnackBar = () => setSnackbarVisible(!snackbarVisible);
  const onDismissSnackBar = () => setSnackbarVisible(false);


  async function getFileBlobAsync(file: string): Promise<Blob> {
    const response = await fetch(file);
    const data = await response.blob();
    const mimeType = response.headers.get("content-type") || "";
    return new Blob([data], { type: mimeType });
  }


  const saveEvent = async () => {
    // TODO: Validate all fields (hint: field values should be stored in state variables).
    // If there's a field that is missing data, then return and show an error
    // using the Snackbar. 
    // Otherwise, proceed onwards with uploading the image, and then the object.
    if(!eventName || !eventLocation || !description || !eventImage) {
      setSnackbarVisible(true);
      return;
    }



    try {


      // NOTE: THE BULK OF THIS FUNCTION IS ALREADY IMPLEMENTED FOR YOU IN HINTS.TSX.
      // READ THIS TO GET A HIGH-LEVEL OVERVIEW OF WHAT YOU NEED TO DO, THEN GO READ THAT FILE!

      // (0) Firebase Cloud Storage wants a Blob, so we first convert the file path
      // saved in our eventImage state variable to a Blob.

      // (1) Write the image to Firebase Cloud Storage. Make sure to do this
      // using an "await" keyword, since we're in an async function. Name it using
      // the uuid provided below.

      // (2) Get the download URL of the file we just wrote. We're going to put that
      // download URL into Firestore (where our data itself is stored). Make sure to
      // do this using an async keyword.

      // (3) Construct & write the social model to the "socials" collection in Firestore.
      // The eventImage should be the downloadURL that we got from (3).
      // Make sure to do this using an async keyword.
      
      // (4) If nothing threw an error, then go back to the previous screen.
      //     Otherwise, show an error.
      setLoad(true);
      const initial = await fetch(eventImage);
      const blob = await initial.blob();
      const storage = getStorage(getApp());
      const storageRef = ref(storage, uuid() + ".jpg");
      const result: UploadResult = await uploadBytes(storageRef, blob);

      const downloadURL = await getDownloadURL(result.ref);


      const db = getFirestore();
      const socialRef = collection(db, "socials");
      const socialDoc: SocialModel = {
        eventName: eventName,
        eventDate: eventDate,
        eventLocation: eventLocation,
        eventDescription: description,
        eventImage: downloadURL,
      };
      await addDoc(socialRef, socialDoc);
      console.log("Finished social creation.");

      setLoad(false);
      navigation.goBack();

    } catch (e) {
      console.log("Error while writing social:", e);
    }
  };

  const Bar = () => {
    return (
      <Appbar.Header>
        <Appbar.Action onPress={navigation.goBack} icon="close" />
        <Appbar.Content title="Socials" />
      </Appbar.Header>
    );
  };

  return (
    <>
      <Bar />
      <View style={{ ...styles.container, padding: 20 }}>
        {/* TextInput */
         <TextInput label="Event Name" value={eventName} onChangeText={setName} />
        }
        {/* TextInput */
         <TextInput label="Event Location" value={eventLocation} onChangeText={setEventLocation} />
        }
        {/* TextInput */
         <TextInput label="Event Description" value={description} onChangeText={setDescription} />
        }
        {/* Button */
          eventDate? <Button mode="outlined"  onPress={showDatePicker}>{eventDate}</Button> : <Button mode="outlined" onPress={showDatePicker}>Select Date</Button>

        }
        {/* Button */
          eventImage? <Button mode="outlined" onPress={imagePicker}>Image Selected</Button> : <Button mode="outlined" onPress={imagePicker}>Select Image</Button>
        }
        {/* Button */
            <Button mode="contained" loading = {load} onPress={saveEvent}>Save Event</Button> 
          
        }
        {/* DateTimePickerModal */
           <DateTimePickerModal isVisible={isDatePickerVisible} mode="datetime" onConfirm={handleConfirm} onCancel={hideDatePicker} /> 
        }
        {/* Snackbar */
           <Snackbar visible={snackbarVisible} onDismiss={onDismissSnackBar} action={{ label: 'Undo', onPress: () => {}}} >Please fill out all fields</Snackbar>
        
        }
      </View>
    </>
  );
}
