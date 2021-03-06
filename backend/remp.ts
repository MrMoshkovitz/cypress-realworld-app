///<reference path="types.ts" />

import express from "express";
import { getTransactionsForUserForApi } from "./database";
import { ensureAuthenticated, validateMiddleware } from "./helpers";
import {
  sanitizeTransactionStatus,
  sanitizeRequestStatus,
  isTransactionQSValidator,
} from "./validators";
import {
  getPaginatedItems,
  isAcceptedRequestTransaction,
  isRequestTransaction,
} from "../src/utils/transactionUtils";
import { Transaction } from "models";
import {Pies, Coloumns} from "./analytics"
const router = express.Router();

router.get(
  "/",
  ensureAuthenticated,
  validateMiddleware([
    sanitizeTransactionStatus,
    sanitizeRequestStatus,
    ...isTransactionQSValidator,
  ]),
  (req, res) => {
    /* istanbul ignore next */
    const transactions = getTransactionsForUserForApi(req.user?.id!, req.query) as Transaction[];
    let functionsData: Transaction[] = [];//if i am charged, the ammount is minus, if payed the ammount is plus
    transactions.forEach((transaction) => {
      if (transaction.receiverId == req.user?.id) {
        if (isRequestTransaction(transaction)) {
          if (isAcceptedRequestTransaction(transaction)) {
            transaction.amount *= -1;
            functionsData.push(transaction);
          } //got charged, invert ammount!
        } else functionsData.push(transaction); // i got paid, ammount should stay
      } else if (transaction.senderId == req.user?.id) {
        if (isRequestTransaction(transaction)) {
          if (isAcceptedRequestTransaction(transaction)) functionsData.push(transaction); //i got paid, ammount should stay
        } else {
          transaction.amount *= -1;
          functionsData.push(transaction);
        } //got charged, invert ammount!
      }
    });



    const sentData={
      Pie:Pies(functionsData),
      Coloumn:Coloumns(functionsData)
    }




    const { totalPages, data: paginatedItems } = getPaginatedItems(
      req.query.page,
      req.query.limit,
      sentData
    );

    res.json({
      results:sentData
    });
  }
);

export default router;