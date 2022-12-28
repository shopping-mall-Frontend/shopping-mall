import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import styled from "styled-components";
import { getAccount, accountAdd } from "../utils/useAPI";

export const AddAccount = () => {
  const { register, handleSubmit } = useForm();
  
  // 은행 코드, 선택 가능 은행 조회
  const [bankCode, setBankCode] = useState('0');
  const [selectBank, setSelectBank] = useState([]);

  const bankNumInput = async () => {
    const selectBank = await getAccount("banks");
    
    setSelectBank(selectBank.filter(e => {return e.disabled === false}));
  };

  useEffect(() => {
    bankNumInput();
  }, []);

  // 계좌 등록
  const onSubmit = async (data) => {
    let body = JSON.stringify({
      bankCode: data.bankCode,
      accountNumber: data.accountNumber0 + data.accountNumber1 + data.accountNumber2 + (data.accountNumber3 ? data.accountNumber3 : ''),
      phoneNumber: data.phoneNumber,
      signature: data.signature,
    });
    
    await accountAdd(body)
    setBankCode('0')
    bankNumInput()
    alert('계좌 등록이 완료되었습니다.')
  };

  // 은행 선택
  const selectChangeHandler = (e) => {
    setBankCode(e.target.value);

    return;
  };

  // maxlenth check
  const maxLengthChk = (object) => {
    if (object.target.value.length > object.target.maxLength) {
      object.target.value = object.target.value.slice(0, object.target.maxLength);
    }
  };

  return (
    <>
      <BankForm onSubmit={handleSubmit(onSubmit)}>
        <select
          {...register("bankCode")}
          className="bank-selector"
          onChange={(e) => {selectChangeHandler(e)}}
          style={{ width: "100px" }}
        >
          <option value={0} key="99" onClick={() => {setBankCode(0)}}>
            은행 선택
          </option>
          {selectBank.map((item, index) => {
            return (
              <option value={item.code} key={index}>
                {item.name}
              </option>
            );
          })}
        </select>

        {bankCode === '0' ? (
          <p>은행을 선택해주세요. <span>* 목록에 은행이 보이지 않는다면 전부 등록된 상태입니다.</span></p>
        ) : (
          <>
            <div className="bank-code-wrap">
              {selectBank.map((item, index) => {
                let input = [];
                if (item.code === bankCode) {
                  for (let i = 0; i < item.digits.length; i++) {
                    input.push(
                      <input
                        {...register(`accountNumber${i}`)}
                        type="number"
                        onInput={(e) => {
                          maxLengthChk(e);
                        }}
                        maxLength={item.digits[i]}
                        key={index++}
                        style={{ width: item.digits[i] * 20 + "px" }}
                      />
                    );
                  }
                }
                return [...input];
              })}
            </div>

            <div>
              <label htmlFor="phoneNumber">휴대폰 번호</label>
              <input
                {...register("phoneNumber")}
                name="phoneNumber"
                type="number"
                onInput={(e) => {
                  maxLengthChk(e);
                }}
                maxLength={11}
              />
            </div>

            <div>
              <label htmlFor="signature">약관 동의</label>
              <input
                {...register("signature")}
                type="checkbox"
                name="signature"
                onClick={(e) => {
                  return (e.target.value = e.target.checked);
                }}
              />
            </div>

            <button type="submit">계좌 등록</button>
          </>
        )}
      </BankForm>
    </>
  );
};

const BankForm = styled.form`
  select {
    border: 1px solid #ddd;
  }

  .bank-code-wrap {
    display: flex;
    gap: 15px;
  }

  input[type="number"] {
    border: 1px solid #ddd;
  }

  input[type="number"]::-webkit-outer-spin-button,
  input[type="number"]::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }
`;
