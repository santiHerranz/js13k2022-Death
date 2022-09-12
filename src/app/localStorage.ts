const STORAGE_KEY = "efdh_";

const get = (key = "", value) => {
  let v = localStorage[STORAGE_KEY+key]
  if (v == undefined)
    save(key, value)
  return v || value
}
const save = (key, value) => {
  localStorage[STORAGE_KEY+key] = value
};

export default { save, get }