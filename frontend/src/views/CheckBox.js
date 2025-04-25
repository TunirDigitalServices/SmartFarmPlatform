 import React from "react";
 import { FormCheckbox} from 'shards-react'


 const Checkbox = ({ obj, onChange }) => {

  return (
        
      <>
        <FormCheckbox
          
          toggle
          id={`custom-checkbox-${obj.index}`}
          name={obj.name}
          checked={obj.status}
          onChange={() => onChange({ ...obj, status: !obj.status })}
        />
        {obj.name}
      </>
    );
  };

  export default Checkbox
