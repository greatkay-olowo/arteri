import React, { useState } from 'react';
import Link from 'next/link';
import styles from '../styles/Home.module.css';
import samplereport from '../public/samplereport.json';
import { useTable } from 'react-table';

function convertDate(inputFormat) {
  function pad(s) {
    return s < 10 ? '0' + s : s;
  }
  var d = new Date(inputFormat);
  return [pad(d.getDate()), pad(d.getMonth() + 1), d.getFullYear()].join('/');
}

export default function Home() {
  const [bvn, setBvn] = useState('');
  const [details, setDetails] = useState({});
  const [crc, setCRC] = useState([]);
  const [firstCentral, setFirstCentral] = useState([]);
  const [creditRegistry, setCreditRegistry] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchReport = async () => {
    setError('');
    setCRC([]);
    setFirstCentral([]);
    setCreditRegistry([]);
    setDetails({});
    setLoading(true);

    if (bvn.length !== 11) {
      alert('BVN must be 11 digits');
      setLoading(false);
      return;
    }
    const response = await fetch(
      `https://api.allawee.com/v1/identity/bvn/${bvn}`,
      {
        headers: {
          method: 'GET',
          'Content-Type': 'application/json',
          Authorization: 'Bearer 1qn3JRn.quiLhgySUesaRS0RpTEDBst6sW9GThI5',
        },
      },
    );
    const status = await response.status;
    if (status === 200) {

      const data = await response.json();
      setDetails(data.data);

      const customerID = data.data.customerId;
      const CBresponse = await fetch(
        `https://api.allawee.com/v1/credit?fields=accounts&customerId=${customerID}`,
        {
          headers: {
            method: 'GET',
            'Content-Type': 'application/json',
            Authorization: 'Bearer 1qn3JRn.quiLhgySUesaRS0RpTEDBst6sW9GThI5',
          },
        },
      );
      const CBdata = await CBresponse.json();
      const cbdata = CBdata.data.accounts;
      // iterate over cbdata
      for (let i = 0; i < cbdata.length; i++) {
        if (cbdata[i].source === 'CRC') {
          setCRC(cbdata[i].data);
          setCreditRegistry(cbdata);
        } else if (cbdata[i].source === 'FIRST_CENTRAL') {
          setFirstCentral(cbdata[i].data);
        } else {
          setCreditRegistry(cbdata);
        }

      }
      setLoading(false);

    } else {
      console.log({ status });
      setError(`BVN not found. Status Report: ${status}`);
      setLoading(false);
    }

    // Please use these 3 test BVN's when testing on API - 22200021533, 22200022408, 22200103620.
  };
  return (
    <div className='container'>
      <nav className='nav'>
        <Link href='/address'>
          <a className='nav-link'>Address Verification</a>
        </Link>
        <Link href='/credit'>
          <a className='nav-link'>Credit Report</a>
        </Link>
      </nav>

      <div className='container  my-5 my-5 mx-auto col-lg-6 col-md-8 col-sm-12'>
        <div className='text-center'>
          <h1 className='display-4'> Query a credit report</h1>
          <p className='lead'>
            Enter a BVN and we&apos;ll give you a credit report.
          </p>
        </div>
        <form>
          <div className='form-group'>
            <input
              type='text'
              value={bvn}
              onChange={(e) => setBvn(e.target.value)}
              className='form-control '
              id='bvn'
              placeholder='Enter BVN'
            />
          </div>
          <button
            type='button'
            className='btn btn-primary form-control my-2 d-print-none'
            onClick={() => {
              fetchReport();
            }}
          >
            {loading ? 'Loading...' : 'Submit'}
          </button>
        </form>
      </div>
      <button className='btn btn-primary form-control my-2 d-print-none' onClick={() => window.print()}>
        Print Credit Report
      </button>
      <div>
        <div className='container'>
          {error !== '' && <p className='text-danger'>{error}</p>}
        </div>

        {details.customerId !== undefined && (
          <>
            <div className='container border rounded-3 mt-5'>

              <div className='text-center'>
                <h1 className='display-4'>Arteri Credit Report</h1>
                <p className='lead'>Here is your credit report.</p>
              </div>

              <div className='container'>
                <hr />

                {/* present data */}
                <div>
                  <h3>Personal Information</h3>
                  <p>
                    <strong>Name:</strong> {details.name}
                  </p>
                  <p>
                    <strong>Date of Birth:</strong> {details.dateOfBirth}
                  </p>

                  <p>
                    <strong>Gender:</strong> {details.gender}
                  </p>
                  <p>
                    <strong>phone:</strong> {details.phone}
                  </p>
                </div>
                <hr />
                <div>
                  <h4>Accounts</h4>
                  {/* crc */}
                  <div>
                    <h5 className='display-6'>CRC</h5>
                    {crc.length === 0 ? (
                      'No CRC History'
                    ) : (
                      <>
                        {crc.map((item, index) => (
                          <div key={index}>
                            <div className='row'>
                              <div className='col'>
                                <p>
                                  <strong>Account Number:</strong> {item?.accountNo ?? 'N/A'}
                                </p>
                                <p>
                                  <strong>Credit Type:</strong> {item?.creditType ?? 'N/A'}
                                </p>
                                <p>
                                  <strong>Currency:</strong> {item?.currency ?? 'N/A'}
                                </p>
                                <p>
                                  <strong>Date of Disbursement:</strong>{' '}
                                  {convertDate(item?.date) ?? 'N/A'}
                                </p>
                                <p>
                                  <strong>Date Reported:</strong>{' '}
                                  {convertDate(item?.dateReported) ?? 'N/A'}
                                </p>
                                <p>
                                  <strong>Deliquency Status:</strong>{' '}
                                  {item?.delinquencyStatus ?? 'N/A'}
                                </p>
                              </div>
                              <div className='col'>
                                <p>
                                  <strong>Lender:</strong> {item?.institutionName ?? 'N/A'}
                                </p>
                                <p>
                                  <strong>Last Updated:</strong> {item.lastUpdated ?? 'N/A'}
                                </p>
                                <p>
                                  <strong>Loan Amount:</strong>{' '}
                                  {item?.loanAmount?.toLocaleString('en-US', {
                                    style: 'currency',
                                    currency: 'NGN',
                                  }) ?? 'N/A'}
                                </p>
                                <p>
                                  <strong>Maturity Date:</strong>{' '}
                                  {convertDate(item?.maturityDate) ?? 'N/A'}
                                </p>
                                <p>
                                  <strong>Outstanding Balance:</strong>{' '}
                                  {item?.outstandingBalance?.toLocaleString('en-US', {
                                    style: 'currency',
                                    currency: 'NGN',
                                  }) ?? 'N/A'}
                                </p>
                                <p>
                                  <strong>Overdue Amount:</strong>{' '}
                                  {item?.overdueAmount?.toLocaleString('en-US', {
                                    style: 'currency',
                                    currency: 'NGN',
                                  }) ?? 'N/A'}
                                </p>
                              </div>
                              <hr />
                            </div>
                          </div>
                        ))}
                      </>
                    )}
                  </div>

                  {/* first central */}
                  <div>
                    <h5 className='display-6'>First Central</h5>
                    {firstCentral.length === 0 ? (
                      'No First Central History'
                    ) : (
                      <>
                        {firstCentral.map((item, index) => (
                          <div key={index}>
                            <div className='row'>
                              <div className='col'>
                                <p>
                                  <strong>Account Number:</strong> {item?.accountNo ?? 'N/A'}
                                </p>
                                <p>
                                  <strong>Credit Type:</strong> {item?.creditType ?? 'N/A'}
                                </p>
                                <p>
                                  <strong>Currency:</strong> {item?.currency ?? 'N/A'}
                                </p>
                                <p>
                                  <strong>Date of Disbursement:</strong>{' '}
                                  {convertDate(item?.date) ?? 'N/A'}
                                </p>
                                <p>
                                  <strong>Date Reported:</strong>{' '}
                                  {convertDate(item?.dateReported) ?? 'N/A'}
                                </p>
                                <p>
                                  <strong>Deliquency Status:</strong>{' '}
                                  {item?.delinquencyStatus ?? 'N/A'}
                                </p>
                              </div>
                              <div className='col'>
                                <p>
                                  <strong>Lender:</strong> {item?.institutionName ?? 'N/A'}
                                </p>
                                <p>
                                  <strong>Last Updated:</strong> {item.lastUpdated ?? 'N/A'}
                                </p>
                                <p>
                                  <strong>Loan Amount:</strong>{' '}
                                  {item?.loanAmount?.toLocaleString('en-US', {
                                    style: 'currency',
                                    currency: 'NGN',
                                  }) ?? 'N/A'}
                                </p>
                                <p>
                                  <strong>Maturity Date:</strong>{' '}
                                  {convertDate(item?.maturityDate) ?? 'N/A'}
                                </p>
                                <p>
                                  <strong>Outstanding Balance:</strong>{' '}
                                  {item?.outstandingBalance?.toLocaleString('en-US', {
                                    style: 'currency',
                                    currency: 'NGN',
                                  }) ?? 'N/A'}
                                </p>
                                <p>
                                  <strong>Overdue Amount:</strong>{' '}
                                  {item?.overdueAmount?.toLocaleString('en-US', {
                                    style: 'currency',
                                    currency: 'NGN',
                                  }) ?? 'N/A'}
                                </p>
                              </div>
                              <hr />
                            </div>
                          </div>
                        ))}
                      </>
                    )}
                  </div>

                  {/* Credit Registry */}
                  <div>
                    <h5 className='display-6'>Credit Registry</h5>
                    {firstCentral.length === 0 ? (
                      'No Credit Registory History'
                    ) : (
                      <>
                        {creditRegistry.map((item, index) => (
                          <div key={index}>
                            <div className='row'>
                              <div className='col'>
                                <p>
                                  <strong>Account Number:</strong> {item?.accountNo ?? 'N/A'}
                                </p>
                                <p>
                                  <strong>Credit Type:</strong> {item?.creditType ?? 'N/A'}
                                </p>
                                <p>
                                  <strong>Currency:</strong> {item?.currency ?? 'N/A'}
                                </p>
                                <p>
                                  <strong>Date of Disbursement:</strong>{' '}
                                  {convertDate(item?.date) ?? 'N/A'}
                                </p>
                                <p>
                                  <strong>Date Reported:</strong>{' '}
                                  {convertDate(item?.dateReported) ?? 'N/A'}
                                </p>
                                <p>
                                  <strong>Deliquency Status:</strong>{' '}
                                  {item?.delinquencyStatus ?? 'N/A'}
                                </p>
                              </div>
                              <div className='col'>
                                <p>
                                  <strong>Lender:</strong> {item?.institutionName ?? 'N/A'}
                                </p>
                                <p>
                                  <strong>Last Updated:</strong> {item.lastUpdated ?? 'N/A'}
                                </p>
                                <p>
                                  <strong>Loan Amount:</strong>{' '}
                                  {item?.loanAmount?.toLocaleString('en-US', {
                                    style: 'currency',
                                    currency: 'NGN',
                                  }) ?? 'N/A'}
                                </p>
                                <p>
                                  <strong>Maturity Date:</strong>{' '}
                                  {convertDate(item?.maturityDate) ?? 'N/A'}
                                </p>
                                <p>
                                  <strong>Outstanding Balance:</strong>{' '}
                                  {item?.outstandingBalance?.toLocaleString('en-US', {
                                    style: 'currency',
                                    currency: 'NGN',
                                  }) ?? 'N/A'}
                                </p>
                                <p>
                                  <strong>Overdue Amount:</strong>{' '}
                                  {item?.overdueAmount?.toLocaleString('en-US', {
                                    style: 'currency',
                                    currency: 'NGN',
                                  }) ?? 'N/A'}
                                </p>
                              </div>
                              <hr />
                            </div>
                          </div>
                        ))}
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div> </>
        )}
      </div>
    </div>
  );
}
