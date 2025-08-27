import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { AppModule } from './app/app.module';

// Add better error logging
console.log('Starting Angular bootstrap...');

platformBrowserDynamic().bootstrapModule(AppModule)
  .then(() => console.log('Angular bootstrap successful'))
  .catch(err => {
    console.error('Angular bootstrap failed with error:');
    console.error(err);
    
    // Display error on page for visibility
    const errorDiv = document.createElement('div');
    errorDiv.style.color = 'red';
    errorDiv.style.padding = '20px';
    errorDiv.style.margin = '20px';
    errorDiv.style.border = '1px solid red';
    errorDiv.innerHTML = `<h2>Angular Bootstrap Error</h2><pre>${err.toString()}</pre>`;
    document.body.appendChild(errorDiv);
  });