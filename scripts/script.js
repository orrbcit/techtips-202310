//------------------------------------------------
// Call this function when the "logout" button is clicked
//-------------------------------------------------
function logout() {
    firebase.auth().signOut().then(() => {
        // Sign-out successful.
        console.log("logging out user");
      }).catch((error) => {
        // An error happened.
      });
}

function addUsersDocField(){
    console.log("inside addUsersDocField function");
    db.collection("users")
    .get()
    .then(snap=>{
      snap.forEach(doc=>{
        db.collection("users").doc(doc.id)
        .update({
          location: "3700 Willingdon Ave, Burnaby"
        })
      })
    })
}
addUsersDocField();
