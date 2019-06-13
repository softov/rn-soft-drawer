/**
 * @author: Luiz Fernando Softov <fernando@softov.com.br>
 * @license: BSD 2
 * @name: expo-drawer
 */
import React from 'react';
import {
  Image,
  Platform,
  StyleSheet,
  View,
  TouchableOpacity,
  Slider,
  Share,
} from 'react-native';

/* Expo deps, since many export {*} from 'expo'; is deprecated */
import * as ImagePicker from 'expo-image-picker';
import * as Permissions from 'expo-permissions';
import { captureRef as takeSnapshotAsync } from 'react-native-view-shot';
import { MaterialIcons } from '@expo/vector-icons';

import { ColorPicker, fromHsv } from 'react-native-color-picker';
import { DrawPad } from './rn-draw';

export default class SoftDrawer extends React.Component {

  constructor(props) {
    super(props);
    this._drawRef = null;
    this._editorRef = null;
    this._isMounted = null;

    this.state = {
      isDrawActive: true,
      isOptionsActive: false,

      selectedColor: '#84c300',
      strokeColor: '#84c300',
      strokeWidth: 4,

      strokesCount: 0,
      mediaUri: null,
    };
  }
  /****************************************************************************************************/
  componentWillMount() {
    this._isMounted = true;
  }
  /**************************************************/
  componentWillUnmount() {
    this._drawRef = null;
    this._editorRef = null;
    this._isMounted = null;
  }
  /**************************************************/
  componentDidMount() {
    this.getPermissionAsync();
  }
  /****************************************************************************************************/
  getPermissionAsync = async () => {

    const { status } = await Permissions.askAsync(Permissions.CAMERA_ROLL);
    if (status !== 'granted') {
      alert('Sorry, we need camera roll permissions to make this work!');
    }
  }
  /****************************************************************************************************/
  actionOptionsToggleActive = () => this.setState({ isOptionsActive: !this.state.isOptionsActive });
  /**************************************************/
  actionDrawerToggleActive = () => this.setState({ isDrawActive: !this.state.isDrawActive });
  /****************************************************************************************************/
  actionDrawerRewind = () => {
    console.log('actionDrawerRewind');

    if (!this._drawRef) {
      return;
    }

    this._drawRef.rewind();
  }
  /**************************************************/
  actionDrawerClear = () => {
    console.log('actionDrawerClear');

    if (!this._drawRef) {
      return;
    }

    this._drawRef.clear();
  }
  /**************************************************/
  actionPictureSelect = async () => {

    console.log('actionPictureSelect');

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Image,
    });

    if (!result.cancelled) {
      this.setState({
        mediaUri: result.uri,
      });
    }
  }
  /**************************************************/
  actionPictureShare = async () => {

    console.log('actionPictureShare');

    if (!this._editorRef) {
      return;
    }

    // TODO, try catch this ?
    const uriSnap = await takeSnapshotAsync(this._editorRef, {
      result: 'tmpfile',
      // height: pixels,
      // width: pixels,
      quality: 1.0,
      format: 'png',
    });

    if (!uriSnap) {
      alert('Can\'t snapshot!');
      return;
    }

    try {
      const shareResult = await Share.share({
        title: 'Picture Test',
        url: uriSnap,
      });

      console.log('Share result: ');
      console.log(shareResult);

      if (shareResult.action === Share.sharedAction) {
        if (shareResult.activityType) {
          // shared with activity type of result.activityType
        } else {
          // shared
        }
      } else if (shareResult.action === Share.dismissedAction) {
        // dismissed
      }

    } catch (error) {
      alert('Can\'t share file', error.message);
      console.log('Can\'t share file');
      console.log(error);
    }

    // let uri = (Platform.OS === 'ios') ? ('file://' + result) : result;
    // this.props.onFinish({
    //   uri: uri,
    //   name: (result).split('/').pop(),
    //   type: 'image/png',
    // });
  }
  /****************************************************************************************************/
  renderTopBar() {

    return (
      <View style={styles.topBar}>
        <View style={[styles.toggleButton, { alignSelf: 'flex-start' }]}>
          <TouchableOpacity style={styles.iconShadow} onPress={this.actionDrawerToggleActive}>
            <MaterialIcons name={this.state.isDrawActive ? 'lock-open' : 'lock'} size={32} color="white" />
          </TouchableOpacity>
        </View>

        <View style={[styles.toggleButton, { alignSelf: 'flex-start' }]}>
          {(this.state.strokesCount > 0) && <TouchableOpacity style={styles.iconShadow} onPress={this.actionDrawerClear}>
            <MaterialIcons name="close" size={32} color="white" />
          </TouchableOpacity>}
        </View>

        <View style={[styles.toggleButton, { alignSelf: 'flex-start' }]}>
          {(this.state.strokesCount > 0) && <TouchableOpacity style={styles.iconShadow} onPress={this.actionDrawerRewind}>
            <MaterialIcons name="undo" size={32} color="white" />
          </TouchableOpacity>}
        </View>

        <View style={[styles.toggleButton, { alignSelf: 'flex-end' }]}>
          <TouchableOpacity style={styles.iconShadow} onPress={this.actionOptionsToggleActive}>
            <View
              style={{
                height: 30,
                width: 30,
                borderRadius: 14,
                backgroundColor: this.state.strokeColor,
                borderWidth: 1,
                justifyContent: 'center',
                alignItems: 'center',
                alignSelf: 'center',
                borderColor: '#FFFFFF',
              }}>
              <View
                style={{
                  height: this.state.strokeWidth,
                  width: this.state.strokeWidth,
                  borderRadius: (this.state.strokeWidth / 2) + 1,
                  backgroundColor: '#000000',
                  borderWidth: 1,
                  borderColor: this.state.strokeColor,
                }}
                backgroundColor="#000000"
              />
            </View>
          </TouchableOpacity>
        </View>
      </View>
    );
  }
  /****************************************************************************************************/
  renderEditorOptions() {

    const strokeSize = (this.state.strokeWidth < 2) ? 2 : this.state.strokeWidth * 2;

    if (!this.state.isOptionsActive) {
      return <View />;
    }

    return (
      <View
        style={{
          position: 'absolute',
          top: 60,
          right: 2,
          height: '60%',
          width: '50%',
          justifyContent: 'center',
        }}>
        <Slider
          step={1}
          minimumValue={1}
          maximumValue={30}
          // minimumTrackTintColor="rgba(0, 122, 255)"
          minimumTrackTintColor="#007AFF"
          maximumTrackTintColor="#b7b7b7"
          animationType="spring"
          animateTransitions
          thumbTouchSize={{
            width: 50,
            height: 50,
          }}
          value={this.state.strokeWidth}
          trackStyle={{
            height: 2
          }}
          thumbStyle={[styles.thumb, {
            // backgroundColor: this.state.strokeColor,
            backgroundColor: '#FFFFFF',
            width: strokeSize,
            height: strokeSize,
            borderRadius: strokeSize / 2,
          }]}
          onValueChange={(value) => { this.setState({ strokeWidth: value }); }}
        />
        <View style={{ flex: 1, flexDirection: 'column' }}>
          <ColorPicker
            style={{ flex: 1 }}
            color={this.state.selectedColor}
            onColorSelected={(color) => {
              this.setState({
                isOptionsActive: false,
                selectedColor: color,
                strokeColor: fromHsv(color),
              });
            }}
            onColorChange={(color) => {
              this.setState({
                selectedColor: color,
                strokeColor: fromHsv(color),
              });
            }}
          />
        </View>
      </View>
    );
  }
  /**************************************************/
  renderBottomBar() {
    return (
      <View style={styles.bottomBar}>
        <View style={[styles.toggleButton, { alignSelf: 'flex-start' }]}>
          <TouchableOpacity style={styles.iconShadow} onPress={this.actionPictureSelect}>
            <MaterialIcons name="add-a-photo" size={32} color="white" />
          </TouchableOpacity>
        </View>

        <View style={[styles.toggleButton, { alignSelf: 'flex-start' }]} />

        <View style={[styles.toggleButton, { alignSelf: 'flex-start' }]} />

        <View style={[styles.toggleButton, { alignSelf: 'flex-end' }]}>
          <TouchableOpacity style={styles.iconShadow} onPress={this.actionPictureShare}>
            <MaterialIcons name="send" size={32} color="white" />
          </TouchableOpacity>
        </View>
      </View>
    );
  }
  /**************************************************/
  render() {

    return (
      <View style={{ flex: 1, height: '100%' }}>
        <View
          collapsable={false}
          ref={ref => (this._editorRef = ref)}
          style={{
            flex: 1,
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '100%',
          }}>
          {this.state.mediaUri && <Image source={{ uri: this.state.mediaUri }} style={[styles.imageActive]} />}
          <DrawPad
            ref={ref => (this._drawRef = ref)}
            drawActive={this.state.isDrawActive}
            // strokes={this.state.strokes}
            containerStyle={{
              backgroundColor: 'rgba(0,0,0,0.01)',
              // backgroundColor: 'transparent',

              flex: 1,
              position: 'absolute',
              top: 0,
              left: 0,
              height: "100%",
              width: "100%",
              flexDirection: 'row',
              justifyContent: 'space-between',
            }}
            color={this.state.strokeColor}
            strokeWidth={this.state.strokeWidth * 2}
            onChangeStrokes={(strokes) => {
              console.log('onChangeStrokes', strokes.length);
              this.setState({
                // strokes: strokes,
                isOptionsActive: false,
                strokesCount: strokes.length,
              });
              // Keyboard.dismiss();
            }}
            onClear={() => {
              console.log('onClear');
              this.setState({
                isOptionsActive: false,
                strokesCount: 0,
              });
            }}
          />
        </View>
        {this.renderTopBar()}
        {this.renderBottomBar()}
        {this.renderEditorOptions()}
      </View>
    );
  }
  /****************************************************************************************************/
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },

  topBar: {
    flex: 1,
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  bottomBar: {
    flex: 1,
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  toggleButton: {
    flex: 0.25,
    height: 40,
    marginHorizontal: 2,
    marginBottom: 10,
    marginTop: 20,
    padding: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },

  iconShadow: {
    shadowColor: 'black',
    shadowOpacity: 0.5,
    shadowRadius: 5,
    shadowOffset: {
      width: 0,
      height: 1,
    },
  },

  imageActive: {
    flex: 1,
    resizeMode: 'cover',
    alignSelf: 'stretch',
    backgroundColor: '#FFFFFF',
  },
});
