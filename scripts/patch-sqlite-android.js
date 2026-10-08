const fs = require('fs');
const path = require('path');

const files = [
  'node_modules/react-native-sqlite-storage/platforms/android/build.gradle',
  'node_modules/react-native-sqlite-storage/platforms/android-native/build.gradle',
];

for (const relativePath of files) {
  const file = path.join(__dirname, '..', relativePath);
  if (!fs.existsSync(file)) {
    continue;
  }

  let text = fs.readFileSync(file, 'utf8');
  text = text.replace(/buildscript \{[\s\S]*?\n\}\n\n/, '');
  text = text.replace(/\n\s*lintOptions \{\n\s*abortOnError false\n\s*\}\n/, '\n');
  text = text.replace(/jcenter\(\)/g, 'mavenCentral()');
  fs.writeFileSync(file, text);
}
