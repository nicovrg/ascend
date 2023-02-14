import { View, Pressable, Text, TextInput, StyleSheet} from "react-native";
import tw from "twrnc";
import { useState } from "react";
import { globalStyles } from "../GlobalStyles";
import { Colors } from "../components/Colors";

export function Home() {
  const [amount, setAmount] = useState("");
  const [inputActive, setInputActive] = useState(false);

  const updateAmount = (string: string) => {
    if (/^[0-9]*(\.[0-9]{0,4})?$/.test(string) || string.length === 0) {
      setAmount(string);
    }
  };

  return (
    <View style={tw`flex-1 p-3 items-center bg-neutral-900`}>
      <Text style={[globalStyles.text, tw`text-6xl font-bold mt-15`]}>
        30 days
      </Text>
      <Text style={[globalStyles.text, tw`text-3xl mt-4`]}>
        to become a chad
      </Text>
      <Text style={[globalStyles.text, tw` mb-20`]}>
        stake and hold yourself accountable
      </Text>
      <View
        style={[
          tw`px-1 py-1 rounded-md border-neutral-600 mb-15	flex-row border-2	border-transparent`,
          inputActive ? styles.inputFocus : {},
          styles.inputWrapper,
        ]}
        onPointerDown={() => setInputActive(!inputActive)}
      >
        <TextInput
          underlineColorAndroid="transparent"
          style={[
            tw`text-xl px-1 py-1 rounded-md border-neutral-600`,
            styles.input,
            styles.inputChild,
          ]}
          onChangeText={(e) => updateAmount(e)}
          value={amount}
          placeholder={"Amount"}
          placeholderTextColor={Colors.lightGray}
          returnKeyType={"done"}
          keyboardType="numeric"
        />
        <Text style={[styles.currency, styles.inputChild]}>SOL</Text>
        <Text style={[styles.maxInput, styles.inputChild]}>Max</Text>
      </View>
      <Pressable style={[tw`bg-black px-6 py-3 rounded-md`, styles.button]}>
        <Text style={[globalStyles.text, tw`text-2xl text-green-500`]}>
          Ascend
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  button: {
    shadowColor: "green",
    shadowOffset: { width: 4, height: 4 },
  },
  input: {
    outline: "none",
    "-webkit-appearance": "none",
    borderWidth: 1,
    borderColor: "transparent",
    outlineStyle: "none",
    color: "white",
    width: 150,
  },
  inputWrapper: {
    backgroundColor: Colors.darker,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  inputChild: {
    margin: 4,
  },
  inputFocus: {
    borderWidth: 2,
    borderColor: "green",
  },
  currency: {
    color: "#AAAAAA",
  },
  maxInput: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
    fontWeight: "bold",
    color: "white",
    backgroundColor: Colors.black,
  },
});
