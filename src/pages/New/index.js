import { useState, useEffect, useContext } from 'react';

import firebase from '../../services/firebaseConnection';
import { useHistory, useParams } from 'react-router-dom';

import Header from '../../components/Header';
import Title from '../../components/Title';
import { AuthContext } from '../../contexts/auth';
import { toast } from 'react-toastify';

import { FiPlus } from 'react-icons/fi';
import './new.css';

export default function New(){

    const { id } = useParams();
    const history = useHistory();

    const [loadCustomers, setLoadCustomers] = useState(true);
    const [customers, setCustomers] = useState([]);
    const [customerSelected, setCustomerSelected] = useState(0);

    const [assunto, setAssunto] = useState('Suporte');
    const [status, setStatus] = useState('Aberto');
    const [complemento, setComplemento] = useState('');
    const [idCustomer, setIdCustomer] = useState(false);

    const { user } = useContext(AuthContext);
// --------------------------------------------------------------------------------------------->

    useEffect(() => {
        async function loadCustomers(){
            await firebase.firestore().collection('customers')
            .get()
            .then((snapshot) => {
                let lista = [];

                snapshot.forEach((doc) => {
                    lista.push({
                        id: doc.id,
                        nomeFantasia: doc.data().nomeFantasia,
                    })
                })
                if(lista.length === 0){
                    console.log('Nenhuma Empresa Encontrada!!');
                    setCustomers([ {id: '1', nomeFantasia: ''} ]);
                    setLoadCustomers(false);
                    return;
                }
                setCustomers(lista);
                setLoadCustomers(false);

                if(id){
                    loadId(lista);
                }
            })
            .catch((error) => {
                console.log('Ocorreu um erro!!', error);
                setLoadCustomers(false);
                setCustomers([ {id: '1', nomeFantasia: ''} ]);
            })
        }
        loadCustomers();
    }, [])
// --------------------------------------------------------------------------------------------->

    async function loadId(lista){
        await firebase.firestore().collection('chamados').doc(id)
        .get()
        .then((snapshot) => {
            setAssunto(snapshot.data().assunto);
            setStatus(snapshot.data().status);
            setComplemento(snapshot.data().complemento);

            let index = lista.findIndex(item => item.id === snapshot.data().clienteId);
            setCustomerSelected(index);
            setIdCustomer(true);
        })
        .catch((error) => {
            console.log(error);
            setIdCustomer(false);
        })
    }
// --------------------------------------------------------------------------------------------->

    async function handleRegister(event){
        event.preventDefault();

        if(idCustomer){
            await firebase.firestore().collection('chamados')
            .doc(id)
            .update({
                cliente: customers[customerSelected].nomeFantasia,
                clienteId: customers[customerSelected].id,
                assunto: assunto,
                status: status,
                complemento: complemento,
                userId: user.uid
            })
            .then(() => {
                toast.success('Chamado editado com Sucesso!!');
                setCustomerSelected(0);
                setComplemento('');
                history.push('/dashboard');
            })
            .catch((error) => {
                toast.error('Erro ao registrar, tente novamente mais tarde.')
                console.log(error);
            })
            return;
        }

        await firebase.firestore().collection('chamados')
        .add({
            created: new Date(),
            cliente: customers[customerSelected].nomeFantasia,
            clienteId: customers[customerSelected].id,
            assunto: assunto,
            status: status,
            complemento: complemento,
            userId: user.uid
        })
        .then(() => {
            toast.success('Chamado Registrado com Sucesso!!');
            setComplemento('');
            setCustomerSelected(0);
        })
        .catch((error) => {
            toast.error('Erro ao Registrar, tente novamente mais tarde!');
            console.log(error);
        })
    }
// --------------------------------------------------------------------------------------------->

    function handleChangeSelect(event){
        setAssunto(event.target.value);
    }
// --------------------------------------------------------------------------------------------->

    function handleOptionChange(event){
        setStatus(event.target.value);
    }
// --------------------------------------------------------------------------------------------->

    function handleChangeCustomers(event){
        setCustomerSelected(event.target.value);
    }
// --------------------------------------------------------------------------------------------->

    return(
        <div>
            <Header />
            <div className='content'>
                <Title name='Novo Chamado'>
                        <FiPlus size={25} color='#000'/>
                </Title>
                <div className='container'>
                    <form className='form-profile' onSubmit={handleRegister}>
                        <label>Cliente</label>

                        {loadCustomers ? (
                            <input type='text' disabled={true} value='Carregando Clientes ...' />
                        ) : (
                            <select value={customerSelected} onChange={handleChangeCustomers}>
                                {customers.map((item, index) => {
                                    return(
                                        <option key={item.id} value={index}>
                                            {item.nomeFantasia}
                                        </option>
                                    );
                                })}
                            </select>
                        )}

                        <label>Assunto</label>
                        <select value={assunto} onChange={handleChangeSelect}>
                            <option value='Suporte'>Suporte</option>
                            <option value='Visita Técnica'>Visita Técnica</option>
                            <option value='Financeiro'>Financeiro</option>
                        </select>
                        
                        <label>Status</label>
                        <div className='status'>
                            <input type='radio' name='radio' value='Aberto' onChange={handleOptionChange}
                                checked={status === 'Aberto'} />
                            <span>Em Aberto</span>
                            
                            <input type='radio' name='radio' value='Pendente' onChange={handleOptionChange}
                                checked={status === 'Pendente'} />
                            <span>Pendente</span>
                            
                            <input type='radio' name='radio' value='Fechado' onChange={handleOptionChange} 
                                checked={status === 'Fechado'} />
                            <span>Fechado</span>
                        </div>
                        
                        <label>Complemento</label>
                        <textarea type='text' placeholder='Descreva sua solicitação (Opcional)' value={complemento}
                        onChange={ (event) => setComplemento(event.target.value) } />
                        
                        <button type='submit'>Registrar</button>
                    </form>
                </div>
            </div>
        </div>
    );
}