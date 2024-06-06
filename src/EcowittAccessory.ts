import {
  PlatformAccessory,
  /*CharacteristicValue,*/ Service,
} from "homebridge";
import { EcowittPlatform } from "./EcowittPlatform";

import * as Utils from "./Utils.js";

//------------------------------------------------------------------------------

export class EcowittAccessory {
  constructor(
    protected readonly platform: EcowittPlatform,
    protected readonly accessory: PlatformAccessory,
    protected readonly model: string,
    protected readonly modelName: string
  ) {
    this.setModel(model, modelName);

    this.accessory
      .getService(this.platform.Service.AccessoryInformation)!
      .setCharacteristic(this.platform.Characteristic.Manufacturer, "Ecowitt")
      .setCharacteristic(
        this.platform.Characteristic.ProductData,
        `${platform.baseStationInfo.frequency}Hz`
      )
      .setCharacteristic(
        this.platform.Characteristic.SerialNumber,
        platform.baseStationInfo.serialNumber
      )
      .setCharacteristic(
        this.platform.Characteristic.HardwareRevision,
        platform.baseStationInfo.hardwareRevision
      )
      .setCharacteristic(
        this.platform.Characteristic.SoftwareRevision,
        platform.baseStationInfo.softwareRevision
      )
      .setCharacteristic(
        this.platform.Characteristic.FirmwareRevision,
        platform.baseStationInfo.firmwareRevision
      )
      .addOptionalCharacteristic(this.platform.Characteristic.ConfiguredName);
  }

  //----------------------------------------------------------------------------

  getModel() {
    return this.accessory
      .getService(this.platform.Service.AccessoryInformation)!
      .getCharacteristic(this.platform.Characteristic.Model);
  }

  setModel(model: string, name: string) {
    this.accessory
      .getService(this.platform.Service.AccessoryInformation)!
      .setCharacteristic(this.platform.Characteristic.Model, model)
      .setCharacteristic(this.platform.Characteristic.Name, name);
  }

  //----------------------------------------------------------------------------

  setSerialNumber(serialNumber: string) {
    this.accessory
      .getService(this.platform.Service.AccessoryInformation)!
      .setCharacteristic(
        this.platform.Characteristic.SerialNumber,
        serialNumber
      );
  }

  //----------------------------------------------------------------------------

  update(dataReport) {
    this.platform.log.error("Update not implemented:", dataReport);
  }

  //---------------------------------------------------------------------------

  setName(service: Service, name: string) {
    service.setCharacteristic(this.platform.Characteristic.Name, name);
  }

  updateName(service: Service, name: string) {
    service.updateCharacteristic(this.platform.Characteristic.Name, name);
  }

  //----------------------------------------------------------------------------

  setConfiguredName(service: Service, name: string) {
    service.addOptionalCharacteristic(
      this.platform.Characteristic.ConfiguredName
    );
    service.addCharacteristic(
      this.platform.Characteristic.ConfiguredName,
      name
    );
  }

  //---------------------------------------------------------------------------

  private serviceUuid(name: string) {
    const serviceId = this.platform.config.mac + "_" + name;
    return this.platform.api.hap.uuid.generate(serviceId);
  }

  //---------------------------------------------------------------------------

  setStatusActive(service: Service, active: boolean) {
    service.setCharacteristic(
      this.platform.Characteristic.StatusActive,
      active
    );
  }

  updateStatusActive(service: Service, active: boolean) {
    service.updateCharacteristic(
      this.platform.Characteristic.StatusActive,
      active
    );
  }

  //---------------------------------------------------------------------------

  addOccupancySensor(name: string) {
    const occupancySensor =
      this.accessory.getService(name) ||
      this.accessory.addService(
        this.platform.Service.OccupancySensor,
        name,
        this.serviceUuid(name)
      );

    return occupancySensor;
  }

  updateOccupancyDetected(service: Service, occupancyDetected: boolean) {
    service.updateCharacteristic(
      this.platform.Characteristic.OccupancyDetected,
      occupancyDetected
        ? this.platform.Characteristic.OccupancyDetected.OCCUPANCY_DETECTED
        : this.platform.Characteristic.OccupancyDetected.OCCUPANCY_NOT_DETECTED
    );
  }

  //---------------------------------------------------------------------------

  addMotionSensor(name: string) {
    const motionSensor =
      this.accessory.getService(name) ||
      this.accessory.addService(
        this.platform.Service.MotionSensor,
        name,
        this.serviceUuid(name)
      );

    return motionSensor;
  }

  updateMotionDetected(service: Service, motionDetected: boolean) {
    service.updateCharacteristic(
      this.platform.Characteristic.MotionDetected,
      motionDetected
    );
  }

  //---------------------------------------------------------------------------

  addBattery(name: string, chargeable = false) {
    const battery =
      this.accessory.getService(this.platform.Service.Battery) ||
      this.accessory.addService(this.platform.Service.Battery);

    battery.setCharacteristic(this.platform.Characteristic.Name, `${name} 🔋`);

    battery.setCharacteristic(
      this.platform.Characteristic.ChargingState,
      chargeable
        ? this.platform.Characteristic.ChargingState.NOT_CHARGING
        : this.platform.Characteristic.ChargingState.NOT_CHARGEABLE
    );

    battery.setCharacteristic(
      this.platform.Characteristic.StatusLowBattery,
      this.platform.Characteristic.StatusLowBattery.BATTERY_LEVEL_NORMAL
    );

    return battery;
  }

  updateBatteryLevel(service: Service, batteryLevel: number) {
    service.updateCharacteristic(
      this.platform.Characteristic.BatteryLevel,
      batteryLevel
    );
  }

  //---------------------------------------------------------------------------

  updateStatusLowBattery(service: Service, lowBattery: boolean) {
    service.updateCharacteristic(
      this.platform.Characteristic.StatusLowBattery,
      lowBattery
        ? this.platform.Characteristic.StatusLowBattery.BATTERY_LEVEL_LOW
        : this.platform.Characteristic.StatusLowBattery.BATTERY_LEVEL_NORMAL
    );
  }

  //---------------------------------------------------------------------------

  updateCurrentTemperature(service: Service, tempf) {
    const tempInC = Utils.toCelcius(tempf);

    service.updateCharacteristic(
      this.platform.Characteristic.CurrentTemperature,
      tempInC
    );

    this.updateName(service, `Temperature: ${tempInC}°`);

    // service.updateCharacteristic(
    //   this.platform.Characteristic.Name,
    //   `Temperature: ${tempInC}°`
    // );
  }

  //---------------------------------------------------------------------------

  updateCurrentRelativeHumidity(service: Service, humidity) {
    service.updateCharacteristic(
      this.platform.Characteristic.CurrentRelativeHumidity,
      parseFloat(humidity)
    );

    this.updateName(service, `Humidity: ${humidity}%`);

    // service.updateCharacteristic(
    //   this.platform.Characteristic.Name,
    //   `Humidity: ${humidity}%`
    // );
  }

  //---------------------------------------------------------------------------
}
