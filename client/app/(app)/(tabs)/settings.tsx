// rnfe

import { View, Text } from "react-native";
import React, { useState } from "react";
import BackgroundView from "@/components/BackgroundView";
import globalStyles from "@/styles/globalStyles";
import SizedBox from "@/components/SizedBox";
import TextButton from "@/components/TextButton";
import { getAuth } from "@react-native-firebase/auth";
import StyledModal from "@/components/StyledModal";
import Toast from "react-native-toast-message";
import ThemedText from "@/components/ThemedText";

const settings = () => {
  const [signOutModalVisible, setSignOutModalVisible] = useState(false);

  const signOut = async () => {
    await getAuth().signOut();

    Toast.show({
      type: "success",
      text1: "Signed out",
    });
  };

  return (
    <BackgroundView withScreenPadding withSafeArea>
      <ThemedText style={globalStyles.header1}>Settings</ThemedText>
      <SizedBox height={50} />
      <TextButton
        title="Sign Out"
        onPress={() => setSignOutModalVisible(true)}
        variant="secondary"
      />
      <StyledModal
        title="Sign Out"
        body="Are you sure you want to sign out?"
        type="ask"
        submitButtonText="Sign Out"
        visible={signOutModalVisible}
        onSubmit={signOut}
        setModalVisibleCallback={setSignOutModalVisible}
      />
    </BackgroundView>
  );
};

export default settings;

// export default function SettingsScreen() {
//   const [message, setMessage] = useState("");
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);

//   useEffect(() => {
//     fetch("http://10.0.0.10:5000/api/hello")
//       .then((response) => response.json())
//       .then((data) => {
//         setMessage(data.message);
//         setLoading(false);
//       })
//       .catch((err) => {
//         setError(`Failed to fetch data: ${err.message}`);
//         setLoading(false);
//       });
//   }, []);

//   if (loading) {
//     return (
//       <View style={styles.container}>
//         <ActivityIndicator size="large" color="#666" />
//       </View>
//     );
//   }

//   if (error) {
//     return (
//       <View style={styles.container}>
//         <ThemedText style={styles.errorText}>{error}</ThemedText>
//       </View>
//     );
//   }

//   return (
//     <View style={styles.container}>
//       <ThemedText style={styles.messageText}>{message}</ThemedText>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   messageText: {
//     fontSize: 18,
//     color: "#333",
//   },
//   errorText: {
//     fontSize: 16,
//     color: "red",
//   },
// });
