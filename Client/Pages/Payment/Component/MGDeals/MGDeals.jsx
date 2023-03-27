import React, { useState, useEffect } from "react";
import { Modal } from "react-bootstrap";
import moment from "moment/moment";
import { Row, Col } from "react-bootstrap";
import CustomReactTable from "../../../../Components/CustomReactTable";
import CustomButton from "../../../../Components/CustomButton";
import MGDealModal from "./MGDealModal";
import Loader from "../../../../Components/Loader";
import MGDEALS_ACTION from "../MGDealService";
import { MG_DEALS_TABLE_COLUMNS } from "../../configs/commonConsts";

const {getMGDeals, setMGDeals} = MGDEALS_ACTION

const MGDeals = () => {
  const [isCreate, setIsCreate] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [selectedDeal, setSelectedDeal] = useState({});
  const [allDeals, setAllDeals] = useState([]);
  const [tableData, setTableData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchMGDeals() {
      const { data: response } = await getMGDeals();
      if(response && response.data && response.data[0] && response.data[0].mgDeals)
        setAllDeals(response.data[0].mgDeals);
      setIsLoading(false);
    }
    fetchMGDeals();
  }, []);

  useEffect(() => {
    const deals = allDeals.map((deal) => {
      const { id, startDate, endDate } = deal;
      return {
        id: id,
        startDate: moment(startDate).format('DD/MM/YYYY'),
        endDate: moment(endDate).format('DD/MM/YYYY'),
        view: <CustomButton variant="primary" onClick={(e) => handleEditClick(e, deal)}>View/Edit</CustomButton>
      }
    });
    setTableData(deals);
  }, [allDeals]);

  const handleEditClick = (e,deal) => {
    e.preventDefault();
    setSelectedDeal(deal);
    setIsEdit(true);
  }

  const onSubmitCreate = (deals) => {
      setAllDeals([deals]);
      setMGDeals([deals],"create");
      setIsCreate(false);
  }

  const onCancelSubmit = () => {
    setIsCreate(false);
  }

  const handleCreate = (e) => {
    e.preventDefault();
    setIsCreate(true);
  }

  const onEditSubmit = (selectedDeal, deal) => {
      const newDeals = allDeals.filter((deal) => deal.id !== selectedDeal.id);
      setMGDeals([...newDeals, deal],'edit');
      setAllDeals([...newDeals, deal]);
      setIsEdit(false);
  }

  const onEditCancel = () => {
    setIsEdit(false);
  }

  const onDeleteDeal = (selectedDeal) => {
    const newDeals = allDeals.filter((deal) => deal.id !== selectedDeal.id);
      setAllDeals(newDeals)
      setMGDeals(newDeals,'delete');
      setIsEdit(false);
  }

  const columns = React.useMemo(
    () => MG_DEALS_TABLE_COLUMNS,
    []
  );

  return (
    isLoading ? <Loader/>: 
    <div>
      
      <CustomReactTable
        data={tableData}
        columns={columns}
        showPaginationTop={false}
        showPaginationBottom={false}
        minRows={allDeals.length || 3}
      >
        </CustomReactTable>
        <Row>
            <Col sm={3}>
            <CustomButton
              variant="primary"
              onClick={(e) => handleCreate(e)}
              disabled={allDeals.length}
            >Create MG Deal</CustomButton>
            </Col>
        </Row>
            <MGDealModal
                isCreate={isCreate}
                createTitle="Create MG Deal"
                allDeals={allDeals}
                onSubmitCreate={onSubmitCreate}
                onCancelSubmit={onCancelSubmit}
                isEdit={isEdit}
                editTitle="Edit MG Deal"          
                selectedDeal={selectedDeal}
                onEditSubmit={onEditSubmit}
                onEditCancel={onEditCancel}
                onDeleteDeal={onDeleteDeal}
              >
            </MGDealModal>
  
    </div>
  );
};

export default MGDeals;
