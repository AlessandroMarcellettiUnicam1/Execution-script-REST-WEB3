package com.unicam.model;

import java.util.*;

public class MartsiaInstance {

        private List<String> roles;
        private List<String> users;
        private List<Integer> elements;
        private List<List<Integer>> nextElements;
        private List<List<Integer>> previousElements;
        private List<Integer> types;
        private LinkedList<Integer> elementWithConditions;
        private List<Integer> elementWithPublicVar;
        private LinkedList<String> publicvariables;
        private LinkedList<Integer> operators;
        private LinkedList<String> values;
        private LinkedHashMap<Integer, ArrayList<String>> policy;
        private HashMap<String, Integer> taskIdAndMartsiaId;
        private HashMap<String, String> taskIdAndName = new LinkedHashMap<>();

    public MartsiaInstance() {
    }

    public MartsiaInstance(List<String> roles, List<String> users, List<Integer> elements,
                           List<List<Integer>> nextElements, List<List<Integer>> previousElements,
                           List<Integer> types, LinkedList<Integer> elementWithConditions, List<Integer> elementWithPublicVar,
                           LinkedList<String> publicvariables, LinkedList<Integer> operators, LinkedList<String> values,
                           LinkedHashMap<Integer, ArrayList<String>> policy, HashMap<String, Integer> taskIdAndMartsiaId,
                           HashMap<String, String> taskIdAndName) {
        this.roles = roles;
        this.users = users;
        this.elements = elements;
        this.nextElements = nextElements;
        this.previousElements = previousElements;
        this.types = types;
        this.elementWithConditions = elementWithConditions;
        this.elementWithPublicVar = elementWithPublicVar;
        this.publicvariables = publicvariables;
        this.operators = operators;
        this.values = values;
        this.policy = policy;
        this.taskIdAndMartsiaId = taskIdAndMartsiaId;
        this.taskIdAndName = taskIdAndName;
    }

    public HashMap<String, Integer> gettaskIdAndMartsiaId() {
        return taskIdAndMartsiaId;
    }

    public void settaskIdAndMartsiaId(HashMap<String, Integer> taskIdAndMartsiaId) {
        this.taskIdAndMartsiaId = taskIdAndMartsiaId;
    }

    public LinkedHashMap<Integer, ArrayList<String>> getPolicy() {
        return policy;
    }

    public void setPolicy(LinkedHashMap<Integer, ArrayList<String>> policy) {
        this.policy = policy;
    }

    public List<String> getRoles() {
        return roles;
    }

    public void setRoles(List<String> roles) {
        this.roles = roles;
    }

    public List<String> getUsers() {
        return users;
    }

    public void setUsers(List<String> users) {
        this.users = users;
    }

    public List<Integer> getElements() {
        return elements;
    }

    public void setElements(List<Integer> elements) {
        this.elements = elements;
    }

    public List<List<Integer>> getNextElements() {
        return nextElements;
    }

    public void setNextElements(List<List<Integer>> nextElements) {
        this.nextElements = nextElements;
    }

    public List<List<Integer>> getPreviousElements() {
        return previousElements;
    }

    public void setPreviousElements(List<List<Integer>> previousElements) {
        this.previousElements = previousElements;
    }

    public List<Integer> getTypes() {
        return types;
    }

    public void setTypes(List<Integer> types) {
        this.types = types;
    }

    public LinkedList<Integer> getElementWithConditions() {
        return elementWithConditions;
    }

    public void setElementWithConditions(LinkedList<Integer> elementWithConditions) {
        this.elementWithConditions = elementWithConditions;
    }

    public List<Integer> getElementWithPublicVar() {
        return elementWithPublicVar;
    }

    public void setElementWithPublicVar(List<Integer> elementWithPublicVar) {
        this.elementWithPublicVar = elementWithPublicVar;
    }

    public LinkedList<String> getPublicvariables() {
        return publicvariables;
    }

    public void setPublicvariables(LinkedList<String> publicvariables) {
        this.publicvariables = publicvariables;
    }

    public LinkedList<Integer> getOperators() {
        return operators;
    }

    public void setOperators(LinkedList<Integer> operators) {
        this.operators = operators;
    }

    public LinkedList<String> getValues() {
        return values;
    }

    public void setValues(LinkedList<String> values) {
        this.values = values;
    }
}
