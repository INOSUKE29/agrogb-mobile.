import 'react-native-get-random-values';
import 'react-native-gesture-handler';
import { registerRootComponent } from 'expo';

import App from './App';

// catch any errors
const defaultErrorHandler = ErrorUtils.getGlobalHandler();
ErrorUtils.setGlobalHandler((error, isFatal) => {
    console.log('Global Error Handler:', error);
    // Se quiser um alerta visual em caso de erro fatal no startup:
    // if (isFatal) Alert.alert("Erro Fatal", error.message);
    defaultErrorHandler(error, isFatal);
});

registerRootComponent(App);
