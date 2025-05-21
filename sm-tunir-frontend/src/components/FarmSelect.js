// FarmSelect.jsx
import AsyncSelect from 'react-select/async';
import api from '../api/api';


const FarmSelect = ({ userUid, onChange, url, placeholder, defaultval }) => {
  // Load options as the user types
  const loadOptions = async (inputValue) => {
    if (!inputValue || inputValue.length < 2) return [];

    try {
      const res = await api.get(url, {
        params: { search: inputValue }
      });

      return res.data; // already formatted as { value, label }
    } catch (err) {
      console.error("Failed to fetch farms", err);
      return [];
    }
  };


  return (
    <div >
      {defaultval.value ? (
        <AsyncSelect
          cacheOptions
          loadOptions={loadOptions}
          defaultOptions={false}
          placeholder={placeholder}
          onChange={onChange}
          defaultValue={defaultval}
        />
      ) : (
        <AsyncSelect
          cacheOptions
          loadOptions={loadOptions}
          defaultOptions={false}
          placeholder={placeholder}
          onChange={onChange}
        />
      )}
    </div>
  );
};

export default FarmSelect;
