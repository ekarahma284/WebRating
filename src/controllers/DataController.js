const BASE_URL = process.env.WILAYAH_API_BASE_URL;

export default class DataController {
  static async getProvinces(req, res) {
    try {
      const response = await fetch(`${BASE_URL}/provinces.json`);
      const data = await response.json();
      res.json({ success: true, message: "Provinces retrieved successfully", data });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  static async getRegencies(req, res) {
    try {
      const { provinceId } = req.params;
      const response = await fetch(`${BASE_URL}/regencies/${provinceId}.json`);
      if (!response.ok) return res.status(404).json({ success: false, message: "Province not found" });
      const data = await response.json();
      res.json({ success: true, message: "Regencies retrieved successfully", data });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  static async getDistricts(req, res) {
    try {
      const { regencyId } = req.params;
      const response = await fetch(`${BASE_URL}/districts/${regencyId}.json`);
      if (!response.ok) return res.status(404).json({ success: false, message: "Regency not found" });
      const data = await response.json();
      res.json({ success: true, message: "Districts retrieved successfully", data });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  static async getVillages(req, res) {
    try {
      const { districtId } = req.params;
      const response = await fetch(`${BASE_URL}/villages/${districtId}.json`);
      if (!response.ok) return res.status(404).json({ success: false, message: "District not found" });
      const data = await response.json();
      res.json({ success: true, message: "Villages retrieved successfully", data });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  static async getProvinceById(req, res) {
    try {
      const { provinceId } = req.params;
      const response = await fetch(`${BASE_URL}/province/${provinceId}.json`);
      if (!response.ok) return res.status(404).json({ success: false, message: "Province not found" });
      const data = await response.json();
      res.json({ success: true, message: "Province retrieved successfully", data });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  static async getRegencyById(req, res) {
    try {
      const { regencyId } = req.params;
      const response = await fetch(`${BASE_URL}/regency/${regencyId}.json`);
      if (!response.ok) return res.status(404).json({ success: false, message: "Regency not found" });
      const data = await response.json();
      res.json({ success: true, message: "Regency retrieved successfully", data });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  static async getDistrictById(req, res) {
    try {
      const { districtId } = req.params;
      const response = await fetch(`${BASE_URL}/district/${districtId}.json`);
      if (!response.ok) return res.status(404).json({ success: false, message: "District not found" });
      const data = await response.json();
      res.json({ success: true, message: "District retrieved successfully", data });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  static async getVillageById(req, res) {
    try {
      const { villageId } = req.params;
      const response = await fetch(`${BASE_URL}/village/${villageId}.json`);
      if (!response.ok) return res.status(404).json({ success: false, message: "Village not found" });
      const data = await response.json();
      res.json({ success: true, message: "Village retrieved successfully", data });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
}
