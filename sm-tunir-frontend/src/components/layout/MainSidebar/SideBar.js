import React, { useEffect, useState } from "react";
// import { useHistory,Redirect, Link } from "react-router-dom";
import { Navigation } from "react-minimal-side-navigation";
import "react-minimal-side-navigation/lib/ReactMinimalSideNavigation.css";
import api from '../../../api/api';
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";


export default function Sidebar() {
  
  const { t, i18n } = useTranslation();


  const offer = JSON.parse(localStorage.getItem("user"))?.offer_type ?? null;

  
  let role = JSON.parse(localStorage.getItem("user"))?.role??null;
  let commandOption = JSON.parse(localStorage.getItem("user"))?.has_command?? null;
  const [data, setData] = useState([{ Fields: [] }]);
  const [allSimulations, setAllSimulations] = useState([])
  const navigate = useNavigate();

  useEffect(() => {
    const getAllSimulations = async () => {
      try {
          await api.get('/simulation/get-simulations')
              .then(result => {
                  let listSimulations = result.data.simulations
                  if (result.data.type === "success") {
                      setAllSimulations(listSimulations)
                  }
              }).catch(err => {
                  console.log(err)
              })
      } catch (error) {

      }
  }
    const fetchData = async () => {
      const response = await api.get('/field/fields')
      const newData = await response.data;
      setData(newData.farms);
    };
    getAllSimulations()
    // setInterval(()=>{
    //   getAllSimulations()

    // },5000)
    fetchData();
  }, []);
  let Fields = [];
  let Sensors = []
  data.map(item => {
    let fields = item.fields
    if(fields){
      fields.map(itemfield => {
        Fields.push({
          title: itemfield.name,
          itemId: '/Fields/'+itemfield.uid,
          itemUid : itemfield.uid
        });
        let sensors = itemfield.sensors
        if(sensors){
          sensors.map(sensor=>{
            Sensors.push({
              title : sensor.code,
              itemId:'/Sensors/'+sensor.code,
              itemUid : sensor.uid

            })
          })
        }
      })
    }
  });
  let simulations = []

    allSimulations.map(simulation=>{
        simulations.push({
          title: simulation.name,
          itemId: '/Simulations/'+simulation.id,
          // itemUid : itemfield.uid
        })
      
    })


  // const history = useHistory();
  
  
  /*const Fields = [
    {
      title: "Field 1",
      itemId: "/Fields/1"
    },
    {
      title: "Field 2",
      itemId: "/Fields/2"
    },
    {
      title: "Field 3",
      itemId: "/Fields/3"
    }
  ];*/
  
  const AddElementsSubNavItems = [
    {
      title: `${t('farms')}`,
      itemId: "/AddFarm"
    },
    {
      title: `${t('fields')}`,
      itemId: "/AddField"
    },
    {
      title: `${t('sensors')}`,
      itemId: "/AddSensor"
    },
    {
      title: `${t('Equipment')}`,
      itemId: "/AddEquipment"
    },
    {
      title: `${t('water_balance')}`,
      itemId: "/Bilan",
    },
  ];
  
  const ConfigsSubNavItems = [
    {
      title: `${t('Countries')}`,
      itemId: "/admin/configuration"
    },
    {
      title: `${t('Cities')}`,
      itemId: "/admin/configuration/cities"
    },
    {
      title: `${t('Crops')}`,
      itemId: "/admin/configuration/crops"
    },
    {
      title: `${t('Crops Varieties')}`,
      itemId: "/admin/configuration/cropsVariety"
    },
    {
      title: `${t('Soils')}`,
      itemId: "/admin/configuration/soils"
    },
    {
      title: `${t('Irrigations')}`,
      itemId: "/admin/configuration/irrigations"
    }
  ];

  const ManagementSubNavItems = [
    {
      title: `${t('users_manag')}`,
      itemId: "/admin/users",
      elemBefore: () => <i class="fas fa-edit" style={{ width: "20px" }}></i>
    },
    {
     title: `${t('sensors_manag')}`,
     itemId: "/admin/sensors",
     elemBefore: () => <i class="fas fa-edit" style={{ width: "20px" }}></i>
   },
   {
     title: `${t('fields_manag')}`,
     itemId: "/admin/fields",
     elemBefore: () => <i class="fas fa-edit" style={{ width: "20px" }}></i>
   },
   {
     title: `${t('commande_manag')}`,
     itemId: "/admin/commande",
     elemBefore: () => <i class="fas fa-edit" style={{ width: "20px" }}></i>
   },
  ];

  const AddElementsFreeSubNavItems = [
    {
      title: `${t('water_balance')}`,
      itemId: "/Bilan",
      elemBefore: () =><i class="material-icons" style={{ width: "20px" }}>&#xe798;</i>


    },
  ];
      let Items = [
     {
      title: `${t('dashboard')}`,
      itemId: "/",
      elemBefore: () => <i class="fas fa-desktop" style={{ width: "20px" }}></i>
    },
    // {
    //   title: `${t('add_element')}`,
    //   itemId: "/MAdd",
    //   elemBefore: () => (
    //     <i class="fas fa-plus-circle" style={{ width: "20px" }}></i>
    //   ),
    //   subNav: AddElementsSubNavItems
    // },
    {
      title: `${t('fields')}`,
      itemId: "/MFields",
      elemBefore: () => (
        <i class="fas fa-tractor" style={{ width: "20px" }}></i>
      ),
      subNav: Fields
    },
    {
      title: `${t('sensors')}`,
      itemId: "/MSensors",
      elemBefore: () => (
        <i class="fas fa-satellite-dish" style={{ width: "20px" }}></i>
      ),
      subNav : Sensors
    },
    {
      title: `${t('weather_forecast')}`,
      itemId: "/Weather",
      elemBefore: () => <i class="fas fa-cloud" style={{ width: "20px" }}></i>
    },
    {
      title: `${t('Satellite Images')}`,
      itemId: "/satellite-images",
      elemBefore: () => (
        <i class="fas fa-satellite" style={{ width: "20px" }}></i>
      )
    },
    {
      title: `${t('calendar')}`,
      itemId: "/Calendar",
      elemBefore: () => (
        <i class="fas fa-calendar-week" style={{ width: "20px" }}></i>
      )
    },
    {
      title: `${t('my_simulations')}`,
      itemId: "/MSimulations",
      elemBefore: () => (
        <i class="material-icons" style={{ width: "20px" }}>&#xf071;</i>
      ),
      subNav: simulations
    },
    // {
    //   title: `${t('Commands')}`,
    //   itemId: "/Commands",
    //   elemBefore: () => (
    //     <i class="material-icons" style={{ width: "20px" }}>&#xe429;</i>
    //   )
    // },
    {
      title: `${t('calendar')}`,
      itemId: "/Calendar",
      elemBefore: () => (
        <i class="fas fa-calendar-week" style={{ width: "20px" }}></i>
      )
    },
   
    {
      title: `${t('fields_settings')}`,
      itemId: "/AddField",
      elemBefore: () => (
        <i class="fa fa-cog" style={{ width: "20px" }}></i>
      )
    },
    {
      title: `${t('sensor_settings')}`,
      itemId: "/sensor-settings",
      elemBefore: () => (
        <i class="fa fa-cog" style={{ width: "20px" }}></i>
      )
    }
  ];

    
  const addToSidebar = () =>  {
    // let role = JSON.parse(localStorage.getItem("user")).role;
  let role = JSON.parse(localStorage.getItem("user"))?.role??null;

     if(role === "ROLE_ADMIN"){
       return Items.push(
        {
          title: `${t('Configuration')}`,
          itemId : '/Madmin/configuration',
          elemBefore: () => <i class="fas fa-edit" style={{ width: "20px" }}></i>,
          subNav : ConfigsSubNavItems
        },
        {
          title: `${t('Management')}`,
          itemId : '/Madmin/Management',
          elemBefore: () => <i class="fas fa-edit" style={{ width: "20px" }}></i>,
          subNav : ManagementSubNavItems
        },
        // {
        //   title: `${t('collect_weather_data')}`,
        //   itemId: "/admin/collect-data/weather",
        //   elemBefore: () => <i class="fas fa-align-justify" style={{ width: "20px" }}></i>
        // }

       )    

     }  
    
    }


   addToSidebar()
   const displayByOffer = () =>{
    if(offer === "1"){
      return Items = [
        {
          title: `${t('dashboard')}`,
          itemId: "/Dashboard",
          elemBefore: () => <i class="fas fa-desktop" style={{ width: "20px" }}></i>
            

        },
        {
          title: `${t('add_element')}`,
          itemId: "/MAdd",
          elemBefore: () => (
            <i class="fas fa-plus-circle" style={{ width: "20px" }}></i>
          ),
          subNav: AddElementsFreeSubNavItems

        },
        {
          title: `${t('my_simulations')}`,
          itemId: "/MSimulations",
          elemBefore: () => (
            <i class="material-icons" style={{ width: "20px" }}>&#xf071;</i>
          ),
          subNav: simulations
        },
        {
          title: `${t('calendar')}`,
          itemId: "/Calendar",
          elemBefore: () => (
            <i class="fas fa-calendar-week" style={{ width: "20px" }}></i>
          )
        },
        {
          title: `${t('weather_forecast')}`,
          itemId: "/Weather",
          elemBefore: () => <i class="fas fa-cloud" style={{ width: "20px" }}></i>
        }

      ]
    }
   }
   
   const displayByRole = () =>{
    if(role === "ROLE_SUPPLIER"){
      return Items = [
          {
            title: `${t('company_dashboard')}`,
            itemId: "/Dashboard-supplier",
            elemBefore: () => <i class="fas fa-desktop" style={{ width: "20px" }}></i>
              

          },
        {
          title: `${t('my_dashboard')}`,
          itemId: "/",
          elemBefore: () => <i class="fas fa-desktop" style={{ width: "20px" }}></i>
            

        },
        // {
        //   title: `${t('add_element')}`,
        //   itemId: "/MAdd",
        //   elemBefore: () => (
        //     <i class="fas fa-plus-circle" style={{ width: "20px" }}></i>
        //   ),
        //   subNav: AddElementsSubNavItems
        // },
        {
          title: `${t('fields')}`,
          itemId: "/MFields",
          elemBefore: () => (
            <i class="fas fa-tractor" style={{ width: "20px" }}></i>
          ),
          subNav: Fields
        },
        {
          title: `${t('sensors')}`,
          itemId: "/Sensors",
          elemBefore: () => (
            <i class="fas fa-satellite-dish" style={{ width: "20px" }}></i>
          )
        },
        // {
        //   title: `${t('Commands')}`,
        //   itemId: "/Commands",
        //   elemBefore: () => (
        //     <i class="material-icons" style={{ width: "20px" }}>&#xe429;</i>
        //   )
        // },
        {
          title: `${t('my_simulations')}`,
          itemId: "/MSimulations",
          elemBefore: () => (
            <i class="material-icons" style={{ width: "20px" }}>&#xf071;</i>
          ),
          subNav: simulations
        },
        {
          title: `${t('calendar')}`,
          itemId: "/Calendar",
          elemBefore: () => (
            <i class="fas fa-calendar-week" style={{ width: "20px" }}></i>
          )
        },
        {
          title: `${t('weather_forecast')}`,
          itemId: "/Weather",
          elemBefore: () => <i class="fas fa-cloud" style={{ width: "20px" }}></i>
        },
        {
          title: `${t('users_manag')}`,
          itemId: "/supplier/users",
          elemBefore: () => <i class="fas fa-edit" style={{ width: "20px" }}></i>
        },
        {
          title: `${t('sensors_manag')}`,
          itemId: "/supplier/sensors",
          elemBefore: () => <i class="fas fa-edit" style={{ width: "20px" }}></i>
        }

      ]
    }
   } 

   const displayByCommand = () =>{
    if(commandOption === "1" && role === "ROLE_USER"){
      return Items = [
        {
         title: `${t('dashboard')}`,
         itemId: "/",
         elemBefore: () => <i class="fas fa-desktop" style={{ width: "20px" }}></i>
       },
       {
         title: `${t('fields')}`,
         itemId: "/MFields",
         elemBefore: () => (
           <i class="fas fa-tractor" style={{ width: "20px" }}></i>
         ),
         subNav: Fields
       },
       {
         title: `${t('sensors')}`,
         itemId: "/Sensors",
         elemBefore: () => (
           <i class="fas fa-satellite-dish" style={{ width: "20px" }}></i>
         )
       },
       {
         title: `${t('my_simulations')}`,
         itemId: "/MSimulations",
         elemBefore: () => (
           <i class="material-icons" style={{ width: "20px" }}>&#xf071;</i>
         ),
         subNav: simulations
       },
       {
         title: `${t('fields_settings')}`,
         itemId: "/AddField",
         elemBefore: () => (
           <i class="fa fa-cog" style={{ width: "20px" }}></i>
         )
       },
       {
         title: `${t('Commands')}`,
         itemId: "/Commands",
         elemBefore: () => (
           <i class="material-icons" style={{ width: "20px" }}>&#xe429;</i>
         )
       },
       {
         title: `${t('calendar')}`,
         itemId: "/Calendar",
         elemBefore: () => (
           <i class="fas fa-calendar-week" style={{ width: "20px" }}></i>
         )
       },
       {
         title: `${t('weather_forecast')}`,
         itemId: "/Weather",
         elemBefore: () => <i class="fas fa-cloud" style={{ width: "20px" }}></i>
       }
     ];
    }
    if(commandOption === "1" && role === "ROLE_ADMIN"){
      return Items = [
        {
         title: `${t('dashboard')}`,
         itemId: "/",
         elemBefore: () => <i class="fas fa-desktop" style={{ width: "20px" }}></i>
       },
       {
         title: `${t('fields')}`,
         itemId: "/MFields",
         elemBefore: () => (
           <i class="fas fa-tractor" style={{ width: "20px" }}></i>
         ),
         subNav: Fields
       },
       {
         title: `${t('sensors')}`,
         itemId: "/Sensors",
         elemBefore: () => (
           <i class="fas fa-satellite-dish" style={{ width: "20px" }}></i>
         )
       },
       {
         title: `${t('my_simulations')}`,
         itemId: "/MSimulations",
         elemBefore: () => (
           <i class="material-icons" style={{ width: "20px" }}>&#xf071;</i>
         ),
         subNav: simulations
       },
       {
         title: `${t('fields_settings')}`,
         itemId: "/AddField",
         elemBefore: () => (
           <i class="fa fa-cog" style={{ width: "20px" }}></i>
         )
       },
       {
         title: `${t('Commands')}`,
         itemId: "/Commands",
         elemBefore: () => (
           <i class="material-icons" style={{ width: "20px" }}>&#xe429;</i>
         )
       },
       {
         title: `${t('calendar')}`,
         itemId: "/Calendar",
         elemBefore: () => (
           <i class="fas fa-calendar-week" style={{ width: "20px" }}></i>
         )
       },
       {
         title: `${t('weather_forecast')}`,
         itemId: "/Weather",
         elemBefore: () => <i class="fas fa-cloud" style={{ width: "20px" }}></i>
       },
       {
        title: `${t('Configuration')}`,
        itemId : '/Madmin/configuration',
        elemBefore: () => <i class="fas fa-edit" style={{ width: "20px" }}></i>,
        subNav : ConfigsSubNavItems
      },
      {
        title: `${t('Management')}`,
        itemId : '/Madmin/Management',
        elemBefore: () => <i class="fas fa-edit" style={{ width: "20px" }}></i>,
        subNav : ManagementSubNavItems
      },
      // {
      //   title: `${t('collect_weather_data')}`,
      //   itemId: "/admin/collect-data/weather",
      //   elemBefore: () => <i class="fas fa-align-justify" style={{ width: "20px" }}></i>
      // }
     ];
    }
   } 
   displayByOffer()

   displayByRole()
   displayByCommand()
  return (
    <>
      <Navigation
        // you can use your own router's api to get pathname
        activeItemId="/management/members"
        onSelect={({ itemId }) => {
          // maybe push to the route
          if (itemId[1] != "M") {
            if (itemId != "/AddSensor") {
              let uid = 0;
              let id = 0
              if (itemId[1] == "F") {
                
                if(Fields[Fields.findIndex(item => item.itemId === itemId)]){
                  uid = Fields[Fields.findIndex(item => item.itemId === itemId)].itemUid
                }
                //TO SAVE UID IN localStorage GET UID IN Field.js
                
                localStorage.setItem(
                  "Field",
                  uid
                );
              } else {
                localStorage.setItem("Field", 0);
              }
              if(itemId[1] == "S"){
                if(simulations[simulations.findIndex(item => item.itemId === itemId)]){
                  id = simulations[simulations.findIndex(item => item.itemId === itemId)].itemId
                }
                localStorage.setItem(
                  "Simulation",
                  id
                );
              }else {
                localStorage.setItem("Simulation", 0);
              }
              if(itemId[2] == "S"){
                if(Sensors[Sensors.findIndex(item => item.itemId === itemId)]){
                  id = Sensors[Sensors.findIndex(item => item.itemId === itemId)].itemId
                }
                localStorage.setItem(
                  "Sensors",
                  id
                );
              }else {
                localStorage.setItem("Sensors", 0);
              }
              navigate(itemId, { state: uid });;
                // window.location.reload()
            } else {
              navigate(itemId);
              // window.location.reload();

            }
          }
        }}
        items={Items}
      />
    </>
  );
}
