
Утилита для скриптов
1. установите  https://www.postman.com/

2. импортируйте библиотеку PSP-PAYNET.postman_collection.json

3.  запустите скрипты

//----------------------
1.  запустите скрипт авторизации и получите токен  Auth.png
2. заполните объект для регестрации  Reg.png
3. заполните форму для перехода, из метода Reg возьмите PaymentID and Signature  (psp-redirect.html)
   и вставьте в полея в форме  
    operation = PaymentID
	Signature = Signature
	
	Форма отпраки:
<form method="POST" action="https://test.paynet.md/acquiring/getecom">
<input type="text" name="operation" value="152469"/><br>
<input type="text" name="LinkUrlSucces" value="http://localhost:8080/psp/ok?id=1597822954534"/><br>
<input type="text" name="LinkUrlCancel" value="hhttp://localhost:8080/psp/ok?id=1597822954534"/><br>
<input type="text" name="ExpiryDate"   value="2020-08-27T21:07:16"/><br>
<input type="text" name="Signature" value="a59290bc0338b5d0afcdb0b6ce353f9e"/><br>
<input type="text" name="Lang" value="ru"/><br>
<input type="submit" value="Подтверждение заказа" /></form>
