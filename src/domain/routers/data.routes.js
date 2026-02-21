import express from "express";
import DataController from "../../controllers/DataController.js";

const router = express.Router();

// List endpoints
router.get("/provinces", DataController.getProvinces);
router.get("/regencies/:provinceId", DataController.getRegencies);
router.get("/districts/:regencyId", DataController.getDistricts);
router.get("/villages/:districtId", DataController.getVillages);

// Single item endpoints
router.get("/province/:provinceId", DataController.getProvinceById);
router.get("/regency/:regencyId", DataController.getRegencyById);
router.get("/district/:districtId", DataController.getDistrictById);
router.get("/village/:villageId", DataController.getVillageById);

export default router;
