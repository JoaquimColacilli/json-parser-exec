import readlineSync from 'readline-sync';
import fs from 'fs/promises';
import path from 'path';

const DB_FILE = 'database.txt';

async function saveToDatabase(json) {
  const entry = {
    timestamp: new Date().toISOString(),
    data: json
  };
  
  try {
    await fs.appendFile(DB_FILE, JSON.stringify(entry) + '\n');
    console.log('✅ JSON guardado exitosamente');
  } catch (err) {
    console.error('❌ Error al guardar:', err);
  }
}

async function showHistory() {
  try {
    const content = await fs.readFile(DB_FILE, 'utf-8');
    const entries = content.split('\n').filter(Boolean);
    
    console.log('\n📜 Historial de JSONs:');
    entries.forEach((entry, index) => {
      const {timestamp, data} = JSON.parse(entry);
      console.log(`\n[${index + 1}] ${timestamp}`);
      console.log(JSON.stringify(data, null, 2));
    });
  } catch (err) {
    if (err.code === 'ENOENT') {
      console.log('No hay registros guardados');
    } else {
      console.error('❌ Error al leer historial:', err);
    }
  }
}

async function main() {
  while (true) {
    console.log('\n🔍 Parser de JSON');
    console.log('1. Ingresar nuevo JSON');
    console.log('2. Ver historial');
    console.log('3. Salir');
    
    const option = readlineSync.question('\nElige una opción (1-3): ');
    
    if (option === '3') break;
    
    if (option === '1') {
      const input = readlineSync.question('\nIngresa el JSON:\n');
      try {
        const parsed = JSON.parse(input);
        console.log('\n✅ JSON válido:');
        console.log(JSON.stringify(parsed, null, 2));
        
        if (readlineSync.keyInYN('\n¿Deseas guardar este JSON?')) {
          await saveToDatabase(parsed);
        }
      } catch (err) {
        console.error('❌ JSON inválido:', err.message);
      }
    } else if (option === '2') {
      await showHistory();
    }
  }
  
  console.log('\n👋 ¡Hasta luego!');
}

main().catch(console.error);