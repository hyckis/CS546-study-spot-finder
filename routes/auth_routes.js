//import express, express router as shown in lecture code
import {Router} from "express";

const router = Router();

router.route('/').get(async (req, res) => {
  //code here for GET
});

router
  .route('/register')
  .get(registerGuard, async (req, res) => {
    //code here for GET
  })
  .post(async (req, res) => {
    //code here for POST
  });

router
  .route('/signin')
  .get(signinGuard, async (req, res) => {
    //code here for GET
  })
  .post(async (req, res) => {
    //code here for POST
  });

router.route('/member').get(memberAuth, async (req, res) => {
  //code here for GET
});

router.route('/manager').get(managerAuth, async (req, res) => {
  //code here for GET
});

router.route('/signout').get(signoutAuth, async (req, res) => {
  //code here for GET
});

export default router;
