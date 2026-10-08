import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import translations from '../translations';

const Footer = () => {
  return (
    <View style={styles.footer}>
      <View style={styles.link}>
        <Text allowFontScaling={false} style={styles.footerText}>{translations.en.footerTextEtc}</Text>
        <View style={styles.row}>
          {/* <View style={styles.left}>
            <Text allowFontScaling={false} style={styles.err}>{translations.en.footerText}</Text>
          </View> */}
          <View style={styles.right}>
            <Text allowFontScaling={false} style={styles.footerText}>{translations.en.footerText}</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  footer: {
    height: '5%',
    width: '100%',
    backgroundColor: '#e6ffff',
    justifyContent: 'center',
    alignItems: 'flex-end',
    flexDirection: 'row',
    borderTopColor: '#e6ffff',
    paddingBottom: '1%',
    paddingRight:'1.5%'
  },

  link: {
    width: '100%',
    alignItems: 'flex-end',
    paddingRight: '1%',
  },
  footerText: {
    fontSize: 8,
    color: 'black',
  },
  row: {
    flexDirection: 'row',
    justifyContent:'space-between'
  },
  
});

export default Footer;
