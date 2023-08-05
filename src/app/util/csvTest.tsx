import Papa from 'papaparse';

Papa.parse('../data/data-qualified.csv', {
    complete: function(result) {
        console.log(result.data)
  }
});