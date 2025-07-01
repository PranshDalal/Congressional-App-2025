// rnfe

import { View, Text } from "react-native";
import React from "react";
import BackgroundView from "@/components/BackgroundView";
import globalStyles from "@/styles/globalStyles";
import SizedBox from "@/components/SizedBox";
import TextButton from "@/components/TextButton";
import { getAuth } from "@react-native-firebase/auth";

const settings = () => {
  const signOut = async () => {
    await getAuth().signOut();
  }

  return (
    <BackgroundView withScreenPadding withSafeArea>
      <Text style={globalStyles.header1}>Settings</Text>
      <SizedBox height={50} />
      <TextButton title="Sign Out" onPress={signOut} variant="secondary" />
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
//         <Text style={styles.errorText}>{error}</Text>
//       </View>
//     );
//   }

//   return (
//     <View style={styles.container}>
//       <Text style={styles.messageText}>{message}</Text>
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
