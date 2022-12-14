import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TouchableHighlight,
  TouchableWithoutFeedback,
  TextInput,
  Keyboard,
  ScrollView,
  Alert,
} from 'react-native';
import { Fontisto } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { theme } from './color';

const STORAGE_KEY = '@toDos';
const MENU_KEY = '@menu';

export default function App() {
  const [working, setWorking] = useState(true);
  const [text, setText] = useState('');
  const [toDos, setToDos] = useState({});

  useEffect(() => {
    checkInitialMew();
    loadToDos();
  }, []);

  const saveMenu = async (menu) => {
    try {
      await AsyncStorage.setItem(MENU_KEY, menu);
    } catch (error) {
      console.error(error);
    }
  };

  const travel = async () => {
    setWorking(false);
    saveMenu('travel');
  };
  const work = async () => {
    setWorking(true);
    saveMenu('work');
  };

  const checkInitialMew = async () => {
    const menu = await AsyncStorage.getItem(MENU_KEY);
    if (menu === 'work') {
      setWorking(true);
    } else {
      setWorking(false);
    }
  };

  const onChangeText = (payload) => setText(payload);

  const saveToDos = async (toSave) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
    } catch (error) {
      console.error(error);
    }
  };

  const loadToDos = async () => {
    const s = await AsyncStorage.getItem(STORAGE_KEY);
    setToDos(JSON.parse(s));
  };

  const addToDo = async () => {
    if (text === '') {
      return;
    }
    const newToDos = {
      ...toDos,
      [Date.now()]: { text, working, done: false },
    };
    setToDos(newToDos);
    await saveToDos(newToDos);
    setText('');
  };

  const completeToDo = async (key) => {
    const newToDos = {
      ...toDos,
      [key]: { ...toDos[key], done: !toDos[key].done },
    };
    setToDos(newToDos);
    await saveToDos(newToDos);
  };

  const deleteToDo = (key) => {
    Alert.alert('Delete To Do?', 'Are you sure', [
      { text: 'Cancel' },
      {
        text: "I'm sure",
        onPress: async () => {
          const newToDos = { ...toDos };
          delete newToDos[key];
          setToDos(newToDos);
          saveToDos(newToDos);
        },
      },
    ]);
  };

  return (
    // ????????? ????????? ????????? ????????? (TouchableWithoutFeedback => Keyboard.dismiss)
    <View style={styles.container}>
      <StatusBar style="auto" />
      <View style={styles.header}>
        <TouchableOpacity onPress={work}>
          <Text
            style={{
              ...styles.btnText,
              color: working ? 'white' : theme.grey,
            }}
          >
            Work
          </Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={travel}>
          <Text
            style={{
              ...styles.btnText,
              color: !working ? 'white' : theme.grey,
            }}
          >
            Travel
          </Text>
        </TouchableOpacity>
      </View>
      <TextInput
        onSubmitEditing={addToDo}
        onChangeText={onChangeText}
        returnKeyType="done"
        value={text}
        placeholder={working ? 'Add a To Do' : 'Where do you want to go?'}
        style={styles.input}
      />
      <ScrollView>
        {Object.keys(toDos).map(
          (key) =>
            toDos[key].working === working && (
              <View style={styles.toDo} key={key}>
                <Text
                  style={[
                    styles.toDoText,
                    toDos[key].done && styles.finishToDoText,
                  ]}
                >
                  {toDos[key].text}
                </Text>
                <View style={styles.toDoIcons}>
                  <TouchableOpacity onPress={() => completeToDo(key)}>
                    {toDos[key].done === true ? (
                      <Fontisto
                        name="checkbox-active"
                        size={24}
                        color="black"
                      />
                    ) : (
                      <Fontisto
                        name="checkbox-passive"
                        size={24}
                        color="black"
                      />
                    )}
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => deleteToDo(key)}>
                    <Fontisto name="trash" size={24} color="black" />
                  </TouchableOpacity>
                </View>
              </View>
            )
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.bg,
    paddingHorizontal: 20,
  },
  header: {
    justifyContent: 'space-between',
    flexDirection: 'row',
    marginTop: 100,
  },
  btnText: {
    fontSize: 38,
    fontWeight: '600',
  },
  input: {
    backgroundColor: 'white',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 30,
    marginVertical: 20,
    fontSize: 18,
  },
  toDo: {
    backgroundColor: theme.grey,
    marginBottom: 10,
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderRadius: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  toDoText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
  finishToDoText: {
    textDecorationLine: 'line-through',
    color: 'grey',
  },
  toDoIcons: {
    flexDirection: 'row',
  },
});
