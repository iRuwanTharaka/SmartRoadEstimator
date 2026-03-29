import 'react-native-gesture-handler';
import { registerRootComponent } from 'expo';
import { StatusBar } from 'expo-status-bar';
import Navigation from './src/navigation';

function App() {
  return (
    <>
      <Navigation />
      <StatusBar style="light" />
    </>
  );
}

registerRootComponent(App);
