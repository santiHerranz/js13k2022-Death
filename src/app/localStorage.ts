const STORAGE_KEY = "EFDH";

const getData = () => localStorage.getItem(STORAGE_KEY)?JSON.parse(localStorage.getItem(STORAGE_KEY)) : {};
const saveData = (data) => localStorage.setItem(STORAGE_KEY, JSON.stringify(data));

const get = (key = "", value) => getData()[key] || value;
const save = (key, value) => {
  const data = getData();
  data[key] = value;
  saveData(data);
};

export default { save, get }