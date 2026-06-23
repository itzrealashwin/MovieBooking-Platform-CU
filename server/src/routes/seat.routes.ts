import { Router } from "express";
import { lockSeats, unlockSeats, extendLock } from "../controllers/seat.controller";
import { protect } from "../middleware/auth.middleware";

const router = Router();

// All locking mechanisms require a valid user session
router.use(protect);

router.post("/lock", lockSeats);
router.post("/unlock", unlockSeats);
router.post("/extend-lock", extendLock);

export default router;
