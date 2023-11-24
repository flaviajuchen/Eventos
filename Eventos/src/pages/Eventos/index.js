import React, { useState, useEffect } from "react";
import {
  Text,
  View,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Modal,
  Linking,
} from "react-native";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import {
  firestore,
  collection,
  getDocs,
  deleteDoc,
  doc,
} from "../../config/firebaseconfig";
import * as Location from "expo-location";

export default function Eventos() {
  const [eventos, setEventos] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [erro, setErro] = useState("");
  const navigation = useNavigation();

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        console.log("Permission to access location was denied");
      }
    })();
  }, []);

  const fetchData = async () => {
    try {
      const eventosCollection = collection(firestore, "eventos");
      const querySnapshot = await getDocs(eventosCollection);

      const list = [];
      querySnapshot.forEach((doc) => {
        list.push({ ...doc.data(), id: doc.id });
      });

      list.sort((a, b) => {
        const dateA = new Date(a.data);
        const dateB = new Date(b.data);
        return dateA - dateB;
      });

      setEventos(list);
    } catch (error) {
      console.log("Erro ao buscar eventos:", error);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      fetchData();
    }, [])
  );

  const openModal = (event) => {
    setSelectedEvent(event);
    setIsModalVisible(true);
  };

  const closeModal = () => {
    setSelectedEvent(null);
    setIsModalVisible(false);
  };

  const handleDeleteEvent = async () => {
    try {
      if (selectedEvent) {
        const eventDocRef = doc(firestore, "eventos", selectedEvent.id);
        await deleteDoc(eventDocRef);
        closeModal();
        fetchData();
      }
    } catch (error) {
      console.log("Erro ao deletar evento:", error);
    }
  };

  const navigateToNovoEvento = () => {
    navigation.navigate("NovoEvento");
  };

  const openMaps = async () => {
    setErro("");
    try {
      const address = selectedEvent?.local;
      if (address) {
        const location = await Location.geocodeAsync(address);
        if (location.length > 0) {
          const { latitude, longitude } = location[0];
          const url = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;
          Linking.openURL(url);
          setErro("");
        } else {
          setErro("Endereço não encontrado");
        }
      }
    } catch (error) {
      console.log("Error opening Maps:", error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {eventos.length !== 0 ? (
          eventos.map((evento) => (
            <TouchableOpacity key={evento.id} onPress={() => openModal(evento)}>
              <View style={styles.eventoContainer}>
                <Text style={styles.text}>
                  {evento.data} - {evento.hora}
                </Text>
                <Text style={styles.text}>{evento.local}</Text>
                <Text style={styles.text}>{evento.descricao}</Text>
              </View>
            </TouchableOpacity>
          ))
        ) : (
          <Text style={{ fontSize: 18, marginTop: 15, marginLeft: 15 }}>
            Sem eventos...
          </Text>
        )}
      </ScrollView>

      <View style={styles.buttonContainer}>
        <TouchableOpacity onPress={() => navigateToNovoEvento()}>
          <View style={styles.BotaoPadrao}>
            <Text style={styles.BotaoPadraoTexto}>Novo Evento</Text>
          </View>
        </TouchableOpacity>
      </View>

      <Modal visible={isModalVisible} transparent animationType="fade">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.textModal}>
              {selectedEvent?.data} - {selectedEvent?.hora}
            </Text>
            <Text style={styles.textModal}>{selectedEvent?.local}</Text>
            <TouchableOpacity onPress={openMaps} style={styles.mapsButton}>
              <Text style={styles.textoMap}>Abrir no Maps</Text>
            </TouchableOpacity>
            {erro && (
              <Text
                style={{
                  color: "red",
                  textAlign: "center",
                  fontSize: 16,
                  marginTop: 10,
                }}
              >
                {erro}
              </Text>
            )}

            <Text style={styles.textModal}>{selectedEvent?.descricao}</Text>

            <TouchableOpacity onPress={handleDeleteEvent}>
              <View style={styles.deleteButton}>
                <Text style={styles.textoDelete}>Excluir Evento</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity onPress={closeModal} style={styles.closeButton}>
              <Text style={styles.textoClose}>X</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    marginBottom: 70,
  },
  eventoContainer: {
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 15,
    marginTop: 15,
    padding: 15,
    borderWidth: 1,
    borderRadius: 5,
    backgroundColor: "white",
    borderColor: "gray",
  },
  text: {
    fontSize: 18,
    textAlign: "center",
  },
  textModal: {
    fontSize: 18,
    textAlign: "center",
    marginTop: 15,
  },
  buttonContainer: {
    position: "absolute",
    padding: 15,
    bottom: 5,
    width: "100%",
    backgroundColor: "white",
  },
  BotaoPadraoTexto: {
    color: "#f92e6a",
    fontSize: 16,
    textAlign: "center",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
    width: "80%",
    position: "relative",
  },
  deleteButton: {
    backgroundColor: "red",
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
    marginTop: 30,
  },
  textoDelete: {
    color: "white",
  },
  closeButton: {
    position: "absolute",
    top: 0,
    right: 0,
    padding: 20,
  },
  textoClose: {
    color: "#f92e6a",
    fontSize: 16,
  },
  mapsButton: {
    backgroundColor: "green",
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
    marginTop: 10,
  },
  textoMap: {
    color: "white",
  },
});
