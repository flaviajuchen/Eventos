import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";

import Eventos from "./src/pages/Eventos";
import NovoEvento from "./src/pages/NovoEvento";

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Eventos"
        screenOptions={{ headerShown: true }}
      >
        <Stack.Screen
          name="Eventos"
          component={Eventos}
          options={{
            headerTintColor: "#f92e6a",
          }}
        />
        <Stack.Screen
          name="NovoEvento"
          component={NovoEvento}
          options={{
            headerTintColor: "#f92e6a",
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
