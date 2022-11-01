import { useState, useEffect } from "react";
import { StatusBar } from 'expo-status-bar';
import Checkbox from 'expo-checkbox';
import { StyleSheet, Text, View,Platform,FlatList,SafeAreaView,Modal,Button,TextInput } from 'react-native';
import Constants from "expo-constants";
import * as SQLite from "expo-sqlite";

import { FloatingAction } from "react-native-floating-action";

const openDatabase = () => {
  if (Platform.OS === "web") {
    return {
      transaction: () => {
        return {
          executeSql: () => {},
        };
      },
    };
  }
    const db = SQLite.openDatabase("Tasks.db");

    db.transaction((tx) => {
        tx.executeSql(
            "create table if not exists Tasks (TaskId integer primary key not null, Title text, DueDate text, Completed int);"
        );
        });

    return db;
}

const db = openDatabase();

const actions = [
  {
    text: "New Task",
    icon: require("./assets/add.png"),
    name: "newTask",
    position: 1
  }
]

const App = () => {
  const [activeTasks, setActiveTasks] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [title, setTitle] = useState("");
  const [dueDate, setDueDate] = useState("");

 useEffect(() => {
   GetActiveTasks();
  }, []);


const Item = ({ taskId,title,dueDate,completed}) => (
  <View style={styles.item}>
    <Checkbox style={styles.checkbox} value={completed==0 ? false : true} onValueChange={()=>handleComplete(taskId)} />
    <Text style={styles.title}>{title}</Text>
    <Text style={styles.dueDate}>{dueDate}</Text>
  </View>
);

const GetActiveTasks = () => {
    db.transaction((tx) => {
        tx.executeSql("select * from Tasks where Completed=0", [], (_, { rows: { _array } }) =>
            setActiveTasks(_array)
        );
    });
}

const AddTask = (title,dueDate) => {
    db.transaction((tx) => {
        tx.executeSql(
            "insert into Tasks (Title, DueDate, Completed) values (?, ?, 0)", [title,dueDate]
        );
        });
}

  const CompleteTask = (taskId) => {
  db.transaction((tx) => {
      tx.executeSql(
          "update Tasks set Completed=1 where TaskId=?", [taskId]
      );
      });
}
  
const handleComplete = (taskId) => {
  CompleteTask(taskId);
  GetActiveTasks();
}
  
const handleAction = (name) => {
  if (name=="newTask") {
    setModalVisible(true);
  }
}

  const handleSubmitTask = () => {
    AddTask(title,dueDate);
    setModalVisible(false);
    GetActiveTasks();
}
  
const renderItem = ({ item }) => <Item title={item.Title} dueDate={item.DueDate} taskId={item.TaskId} completed={item.Completed} />;
  
  return (
    <SafeAreaView style={styles.container}>
      <Text>TASKMASTER</Text>
      <FlatList data={activeTasks} renderItem={renderItem} keyExtractor={item => item.TaskId} />
      <FloatingAction
        actions={actions}
        overrideWithAction="true"
        onPressItem={name => handleAction(name)}
      />
       <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(!modalVisible);
        }}>
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <TextInput
              style={styles.input}
              onChangeText={(text)=>setTitle(text)}
              value={title}
              placeholder="Title"
              keyboardType="default"
            />
            <TextInput
              style={styles.input}
              onChangeText={(text)=>setDueDate(text)}
              value={dueDate}
              placeholder="Due Date"
              keyboardType="default"
            />
            <Button title="Add New Task" onPress={() => handleSubmitTask()} />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 50,
    marginLeft: 10
  },
  item: {
    backgroundColor: '#4d423d',
    padding: 10,
    marginVertical: 4,
    marginHorizontal: 16,
  },
  title: {
    fontSize: 16,
    color:'#fff'
  },
  dueDate: {
    fontSize: 12,
    color: '#fff',
    marginTop:5
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 22,
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalText: {
    marginBottom: 15,
    textAlign: 'center',
  },
  input: {
    width:200,
    height: 50,
    margin: 12,
    borderWidth: 1,
    padding: 10,
  },
   checkbox: {
    margin: 8,
  },
});


export default App;