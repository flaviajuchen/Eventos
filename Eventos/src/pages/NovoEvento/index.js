import React, { useEffect, useRef, useState } from "react";
import {
  Text,
  View,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from "react-native";
import { firestore, collection, addDoc } from "../../config/firebaseconfig";
import { Picker } from "@react-native-picker/picker";
import { ScrollView } from "react-native-gesture-handler";
import MaskInput, { Masks } from "react-native-mask-input";

import * as Device from "expo-device";
import * as Notifications from "expo-notifications";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

export default function NovoEvento() {
  const notificationListener = useRef();
  const responseListener = useRef();
  const [hora, setHora] = useState("00");
  const [minuto, setMinuto] = useState("00");
  const [novoEvento, setNovoEvento] = useState({
    descricao: "",
    hora: "",
    data: "",
    local: "",
  });

  const [erro, setErro] = useState(null);
  const [sucesso, setSucesso] = useState(null);

  useEffect(() => {
    registerForPushNotificationsAsync().then((token) => {
      console.log(token);
    });

    notificationListener.current =
      Notifications.addNotificationReceivedListener((notification) => {
        // setNotification(notification);
      });

    responseListener.current =
      Notifications.addNotificationResponseReceivedListener((response) => {
        console.log(response);
      });

    return () => {
      Notifications.removeNotificationSubscription(
        notificationListener.current
      );
      Notifications.removeNotificationSubscription(responseListener.current);
    };
  }, []);

  async function schedulePushNotification(dateTime) {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "AVISO!!",
        body: "Seu evento está prestes a começar!",
      },
      trigger: { date: dateTime },
    });
  }

  async function registerForPushNotificationsAsync() {
    let token;

    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync("default", {
        name: "default",
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: "#FF231F7C",
      });
    }

    if (Device.isDevice) {
      const { status: existingStatus } =
        await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      if (existingStatus !== "granted") {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      if (finalStatus !== "granted") {
        alert("Failed to get push token for push notification!");
        return;
      }

      token = (
        await Notifications.getExpoPushTokenAsync({
          projectId: "4c8b4b5c-3291-46a7-a0a3-71d90c1df9dd",
        })
      ).data;
      console.log(token);
    } else {
      alert("Must use physical device for Push Notifications");
    }

    return token;
  }

  const salvarNovoEvento = async () => {
    try {
      if (
        !novoEvento.descricao ||
        !hora ||
        !minuto ||
        !novoEvento.data ||
        !novoEvento.local
      ) {
        setErro("Preencha todos os campos obrigatórios.");
        return;
      }

      const dataCompleta = `${novoEvento.data} ${hora}:${minuto}`;
      const dataFormatada = dataCompleta.replace(
        /(\d{2})\/(\d{2})\/(\d{4})/,
        "$3-$2-$1"
      );
      const eventDateTime = new Date(dataFormatada);

      console.log(eventDateTime);

      if (isNaN(eventDateTime.getTime())) {
        setErro("Data e hora inválidas.");
        return;
      }

      const eventoASalvar = {
        ...novoEvento,
        hora: `${hora}:${minuto}`,
      };

      const docRef = await addDoc(
        collection(firestore, "eventos"),
        eventoASalvar
      );

      schedulePushNotification(eventDateTime);

      setNovoEvento({
        descricao: "",
        hora: "",
        data: "",
        local: "",
      });
      setSucesso("Evento salvo com sucesso!");
      setErro(null);
    } catch (error) {
      console.error("Erro: ", error.message);
      setErro("Erro ao salvar o evento");
    }
  };

  return (
    <ScrollView>
      <View style={styles.container}>
        <View style={styles.horaContainer}>
          <Text style={styles.text}>Horario:</Text>

          <Picker
            style={styles.picker}
            selectedValue={hora}
            onValueChange={(itemValue) => setHora(itemValue)}
          >
            {Array.from({ length: 24 }, (_, i) =>
              i.toString().padStart(2, "0")
            ).map((hour) => (
              <Picker.Item key={hour} label={hour} value={hour} />
            ))}
          </Picker>

          <Picker
            style={styles.picker}
            selectedValue={minuto}
            onValueChange={(itemValue) => setMinuto(itemValue)}
          >
            {Array.from({ length: 60 }, (_, i) =>
              i.toString().padStart(2, "0")
            ).map((minute) => (
              <Picker.Item key={minute} label={minute} value={minute} />
            ))}
          </Picker>
        </View>

        <MaskInput
          style={styles.input}
          value={novoEvento.data}
          onChangeText={(text) => setNovoEvento({ ...novoEvento, data: text })}
          mask={Masks.DATE_DDMMYYYY}
          keyboardType="numeric"
          maxLength={10}
          placeholder="Data"
        />
        <TextInput
          style={styles.input}
          value={novoEvento.local}
          placeholder="Local"
          onChangeText={(text) => setNovoEvento({ ...novoEvento, local: text })}
        />

        <TextInput
          style={styles.descricao}
          value={novoEvento.descricao}
          placeholder="Descrição"
          onChangeText={(text) =>
            setNovoEvento({ ...novoEvento, descricao: text })
          }
        />

        {erro && <Text style={styles.erroText}>{erro}</Text>}
        {sucesso && <Text style={styles.sucessoText}>{sucesso}</Text>}

        <TouchableOpacity
          style={styles.buttonContainer}
          onPress={salvarNovoEvento}
        >
          <Text style={styles.textButton}>Salvar</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    marginTop: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  input: {
    height: 40,
    width: 300,
    borderColor: "gray",
    borderWidth: 1,
    marginBottom: 15,
    paddingHorizontal: 10,
    backgroundColor: "white",
    borderRadius: 5,
  },
  text: {
    paddingHorizontal: 10,
    fontSize: 18,
  },
  descricao: {
    height: 60,
    width: 300,
    borderColor: "gray",
    borderWidth: 1,
    marginBottom: 15,
    paddingHorizontal: 10,
    backgroundColor: "white",
    borderRadius: 5,
  },
  horaContainer: {
    flexDirection: "row",
    gap: 10,
    textAlign: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  buttonContainer: {
    marginTop: 10,
  },
  textButton: {
    width: 300,
    paddingVertical: 10,
    backgroundColor: "green",
    color: "white",
    textAlign: "center",
    fontSize: 18,
  },
  erroText: {
    color: "red",
    marginBottom: 10,
    fontSize: 16,
  },
  sucessoText: {
    color: "green",
    marginBottom: 10,
    fontSize: 16,
  },
  picker: {
    flex: 1,
    height: 40,
    borderColor: "gray",
    borderWidth: 1,
    marginRight: 10,
  },
});
