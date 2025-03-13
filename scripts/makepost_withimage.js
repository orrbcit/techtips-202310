var ImageString;

function listenFileSelect() {
    // listen for file selection
   document.getElementById("mypic-input").addEventListener('change', function (e) {
        file = e.target.files[0];
        if (file) {
            var reader = new FileReader(); // Create a FileReader to read the file

            // When file reading is complete, save it global variable, display it on the page
            reader.onload = function (e) {
                ImageString = e.target.result.split(',')[1]; // Extract Base64 data
                var imgElement = document.getElementById("image-goes-here");
                imgElement.src = "data:image/png;base64," + ImageString;
            };

            // Read the file as a Data URL (Base64 encoding)
            reader.readAsDataURL(file);
        }
    })
}
listenFileSelect();

function savePost() {
    console.log("SAVE POST is triggered");
    firebase.auth().onAuthStateChanged(function (user) {
        if (user) {
            // User is signed in.
            // Do something for the user here. 
            var desc = document.getElementById("description").value;
            db.collection("posts").add({
                owner: user.uid,     //the person who made the post!
                description: desc,
                image: ImageString,
                last_updated: firebase.firestore.FieldValue
                    .serverTimestamp() //current system time
            }).then(doc => {
                console.log("Post document added!");
                console.log(doc.id);
                // Function to display the stored Base64 image on the profile page
                function displayProfileImage(ImageString) {
                    var imgElement = document.getElementById("profileImage");
                    imgElement.src = "data:image/png;base64," + ImageString; // Set the image source
                }
            })
        } else {
            // No user is signed in.
            console.log("Error: no user is logged in");
        }
    });
}


function savePostWithLocation() {
    firebase.auth().onAuthStateChanged(function (user) {
        if (user) {     // User is signed in.  Do something for the user here. 

            // Use location service of the device
            navigator.geolocation.getCurrentPosition((position) => {
                //get location details
                const latitude = position.coords.latitude;
                const longitude = position.coords.longitude;

                //get any other info (from your form)
                var desc = document.getElementById("description").value;

                //create new document into firestore
                db.collection("posts").add({
                    owner: user.uid,
                    description: desc,
                    image: ImageString,
                    latitude: latitude,
                    longitude: longitude,
                    last_updated: firebase.firestore.FieldValue
                        .serverTimestamp() //current system time
                }).then(doc => {
                    console.log("1. Post document added!");
                    console.log(doc.id);
                    //uploadPic(doc.id);
                })
            }, (error) => {
                console.error("Error retrieving location:", error);
            })
        } else {
            console.log("Error: no user is logged in");
        }
    })
}

function saveLocationToFirestore(latitude, longitude) {
    // Replace 'userId' with the user's actual ID or reference
    const userId = "user123";  // e.g., Firebase Auth UID or custom ID
    db.collection("users").doc(userId).set({
        location: {
            latitude: latitude,
            longitude: longitude,
            timestamp: firebase.firestore.FieldValue.serverTimestamp() // optional timestamp
        }
    }, { merge: true }) // 'merge: true' keeps existing data if any
        .then(() => {
            console.log("Location saved successfully!");
        })
        .catch((error) => {
            console.error("Error saving location:", error);
        });
}

// // This functions put the image onto Firesbase Storage
// // Then gets the URL
// // Then updates the URL into the image field of the post document. 
// function uploadPic(postDocID) {
//     console.log("inside uploadPic " + postDocID);
//     var storageRef = storage.ref("images/" + postDocID + ".jpg");

//     storageRef.put(ImageFile)
//         .then(function () {
//             console.log('2. Image uploaded to Cloud Storage.');
//             storageRef.getDownloadURL()
//                 .then(function (url) { // Get URL of the uploaded file
//                     console.log("3. Got the download URL.");
//                     db.collection("posts").doc(postDocID).update({
//                         "image": url // Save the URL into users collection
//                     })
//                         .then(function () {
//                             console.log("4. Added pic URL to Firestore post doc " + postDocID);
//                             savePostIDforUser(postDocID);
//                         })
//                         .catch((error) => {
//                             console.log("error adding pic url to firestore");
//                         })
//                 })
//                 .catch((error) => {
//                     console.log("error getting download url");
//                 })
//         })
//         .catch((error) => {
//             console.log("error uploading to cloud storage");
//         })
// }

//saves the post ID for the user document, "myposts" array field.
function savePostIDforUser(postDocID) {
    firebase.auth().onAuthStateChanged(user => {
        console.log("user id is: " + user.uid);
        console.log("postdoc id is: " + postDocID);
        db.collection("users").doc(user.uid).update({
            myposts: firebase.firestore.FieldValue.arrayUnion(postDocID)
        })
            .then(() => {
                console.log("Saved the post to user's document!");
                alert("Post is complete!");
                window.location.href = "showposts.html";
            })
            .catch((error) => {
                console.error("Failed to save post for the user: ", error);
            });
    })
}